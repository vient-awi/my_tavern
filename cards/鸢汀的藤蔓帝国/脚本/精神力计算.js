// 鸢汀的藤蔓帝国 — 精神力自动计算脚本
// 监听 VARIABLE_UPDATE_ENDED，检测猎物高潮阈值跨越事件，自动计算并注入精神力
// 同时将调教场景中的增量 apply 到猎物库

await waitGlobalInitialized('Mvu');

// -- 境界推导（与 schema.ts 保持同步）----------------------------------
const REALMS = [
  { name: '萌芽期', limit: 100         },
  { name: '扎根期', limit: 1000        },
  { name: '攀援期', limit: 10000       },
  { name: '播散期', limit: 100000      },
  { name: '成荫期', limit: 1000000     },
  { name: '蔽日期', limit: 10000000    },
  { name: '天罗期', limit: 100000000   },
  { name: '归元期', limit: 1000000000  },
];

function getRealmLimit(realmName) {
  const realm = REALMS.find(r => r.name === realmName);
  return realm ? realm.limit : 100;
}

function getNextRealm(realmName) {
  const idx = REALMS.findIndex(r => r.name === realmName);
  return idx >= 0 && idx < REALMS.length - 1 ? REALMS[idx + 1].name : realmName;
}

function deriveRealm(spirit, currentRealm, currentStage) {
  let realm = currentRealm;
  let stage = currentStage;
  let remaining = spirit;

  while (remaining >= getRealmLimit(realm)) {
    remaining -= getRealmLimit(realm);
    stage++;
    if (stage > 9) {
      stage = 1;
      realm = getNextRealm(realm);
    }
  }

  return { realm, stage, spiritRemainder: remaining, limit: getRealmLimit(realm) };
}

// -- 精神力摄取计算 ----------------------------------------------------
const QUALITY_MAP = { '5S': 100, '4S': 20 };
const INTENSITY_MAP = { '强': 1.0, '中': 0.6, '弱': 0.3 };
const SUBMISSION_MAP = { '抵抗': 0.5, '动摇': 0.7, '顺从': 1.0, '依恋': 1.5, '臣服': 2.0 };
const BODY_PARTS = ['乳头', '胸部', '口腔', '阴茎', '阴囊', '尿道', '后穴', '生殖道', '肉珠', '肉唇', '生殖腔'];

function calculateSpirit(quality, intensity, lewdness, submissionStage) {
  const qualityCoeff = QUALITY_MAP[quality] || 20;
  const intensityCoeff = INTENSITY_MAP[intensity] || 0.6;
  const lewdnessCoeff = 1 + lewdness / 500;
  const submissionCoeff = SUBMISSION_MAP[submissionStage] || 0.5;
  return Math.round(qualityCoeff * intensityCoeff * lewdnessCoeff * submissionCoeff);
}

function evaluateQuality(spiritGain) {
  if (spiritGain >= 200) return '极佳';
  if (spiritGain >= 100) return '优秀';
  if (spiritGain >= 30) return '良好';
  return '一般';
}

// 读取猎物的核心属性（兼容 林昊 与 猎物库 两种路径）
function getPreyStats(variables, preyName) {
  if (preyName === '林昊') {
    return {
      threshold:   _.get(variables, 'stat_data.林昊.高潮阈值', 50),
      quality:     _.get(variables, 'stat_data.林昊.精神力品质', '5S'),
      lewdness:    _.get(variables, 'stat_data.林昊.淫荡度', 0),
      stage:       '臣服', // 林昊永远臣服
    };
  }
  return {
    threshold:   _.get(variables, `stat_data.猎物库.${preyName}.高潮阈值`, 100),
    quality:     _.get(variables, `stat_data.猎物库.${preyName}.精神力品质`, '4S'),
    lewdness:    _.get(variables, `stat_data.猎物库.${preyName}.淫荡度`, 0),
    stage:       _.get(variables, `stat_data.猎物库.${preyName}.臣服阶段`, '抵抗'),
  };
}

// -- 主逻辑 ------------------------------------------------------------
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
  const preyMap = _.get(new_variables, 'stat_data.调教场景.猎物', {});
  if (!preyMap || !Object.keys(preyMap).length) return;

  let totalSpiritGain = 0;

  // === 第一遍：检测高潮阈值跨越，计算精神力 ===
  for (const [preyName, preyScene] of Object.entries(preyMap)) {
    const newArousal = _.get(preyScene, '当前高潮值', 0);
    const oldArousal = _.get(old_variables, `stat_data.调教场景.猎物.${preyName}.当前高潮值`, 0);
    const stats = getPreyStats(new_variables, preyName);

    // 跨越阈值检测（防止重复触发）
    if (oldArousal < stats.threshold && newArousal >= stats.threshold) {
      const intensity = _.get(preyScene, '本次高潮强度', '中');
      const spiritGain = calculateSpirit(stats.quality, intensity, stats.lewdness, stats.stage);

      totalSpiritGain += spiritGain;

      // 重置高潮值（连续高潮预留部分唤起）
      const lewdnessBonus = Math.floor(stats.lewdness / 200) * 5;
      _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.当前高潮值`, 20 + lewdnessBonus);

      // 更新猎物的累计贡献与产出品质
      const qualityText = evaluateQuality(spiritGain);
      const preyPath = preyName === '林昊' ? 'stat_data.林昊' : `stat_data.猎物库.${preyName}`;
      const currentTotal = _.get(new_variables, `${preyPath}.累计贡献精神力`, 0);
      _.set(new_variables, `${preyPath}.累计贡献精神力`, currentTotal + spiritGain);
      _.set(new_variables, `${preyPath}.最近产出品质`, qualityText);

      // 记录本次精神力收益到调教场景（供 UI / 日志使用）
      _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.$本次精神收益`, spiritGain);
    }
  }

  // === 第二遍：apply 增量（本轮 → 猎物库 / 林昊）===
  for (const [preyName, preyScene] of Object.entries(preyMap)) {
    const preyPath = preyName === '林昊' ? 'stat_data.林昊' : `stat_data.猎物库.${preyName}`;

    // 臣服进度
    const submissionGain = _.get(preyScene, '本轮臣服收益', 0);
    if (submissionGain !== 0) {
      const current = _.get(new_variables, `${preyPath}.臣服进度`, 0);
      _.set(new_variables, `${preyPath}.臣服进度`, Math.max(0, current + submissionGain));
      _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.本轮臣服收益`, 0);
    }

    // 崩坏值（林昊不设崩坏值，跳过）
    if (preyName !== '林昊') {
      const corruptionGain = _.get(preyScene, '本轮崩坏风险', 0);
      if (corruptionGain !== 0) {
        const current = _.get(new_variables, `${preyPath}.崩坏值`, 0);
        _.set(new_variables, `${preyPath}.崩坏值`, Math.max(0, current + corruptionGain));
        _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.本轮崩坏风险`, 0);
      }
    }

    // 淫荡度
    const lewdnessGain = _.get(preyScene, '本轮淫荡增量', 0);
    if (lewdnessGain !== 0) {
      const current = _.get(new_variables, `${preyPath}.淫荡度`, 0);
      _.set(new_variables, `${preyPath}.淫荡度`, Math.max(0, current + lewdnessGain));
      _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.本轮淫荡增量`, 0);
    }

    // 各部位开发度
    const bodyParts = _.get(preyScene, '部位', {});
    for (const partName of BODY_PARTS) {
      const devGain = _.get(bodyParts, `${partName}.本轮开发程度`, 0);
      if (devGain !== 0) {
        const current = _.get(new_variables, `${preyPath}.部位.${partName}.开发度`, 0);
        _.set(new_variables, `${preyPath}.部位.${partName}.开发度`, Math.max(0, current + devGain));
        _.set(new_variables, `stat_data.调教场景.猎物.${preyName}.部位.${partName}.本轮开发程度`, 0);
      }
    }
  }

  // === 注入精神力 + 手动派生境界 ===
  if (totalSpiritGain > 0) {
    const oldSpirit = _.get(new_variables, 'stat_data.蔺鸢汀.精神力含量', 0);
    const currentRealm = _.get(new_variables, 'stat_data.蔺鸢汀._当前大境界', '萌芽期');
    const currentStage = _.get(new_variables, 'stat_data.蔺鸢汀._当前小阶', 1);

    const newTotalSpirit = oldSpirit + totalSpiritGain;
    const { realm, stage, spiritRemainder, limit } = deriveRealm(newTotalSpirit, currentRealm, currentStage);

    _.set(new_variables, 'stat_data.蔺鸢汀.精神力含量', spiritRemainder);
    _.set(new_variables, 'stat_data.蔺鸢汀._当前大境界', realm);
    _.set(new_variables, 'stat_data.蔺鸢汀._当前小阶', stage);
    _.set(new_variables, 'stat_data.蔺鸢汀._精神力上限', limit);
  }
});
