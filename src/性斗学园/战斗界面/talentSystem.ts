// 天赋系统 - 战斗效果实现
// 处理天赋在战斗中的各种触发效果

import type { TalentData } from '../性斗学园脚本/data/talentDatabase';

// ==================== 敌人七宗罪天赋配置 ====================
// 特定敌人拥有的七宗罪天赋（敌人名称 -> 七宗罪类型）
export const ENEMY_SIN_TALENTS: Record<string, 'lust' | 'wrath' | 'envy' | 'sloth' | 'pride' | 'gluttony' | 'greed'> = {
  // 沐心岚BOSS - 嫉妒
  沐心岚_1: 'envy',
  沐心岚_2: 'envy',
  沐心岚_3: 'envy',
  茉莉: 'envy',
  沐心岚: 'envy',
  // 克里斯BOSS - 暴怒（仅第二阶段触发，由bossSystem控制）
  克里斯_1: 'wrath',
  克里斯_2: 'wrath',
  克里斯: 'wrath',
};

/**
 * 获取敌人的七宗罪天赋类型
 * @param enemyName 敌人名称
 * @returns 七宗罪类型，如果没有则返回null
 */
export function getEnemySinTalentType(
  enemyName: string,
): 'lust' | 'wrath' | 'envy' | 'sloth' | 'pride' | 'gluttony' | 'greed' | null {
  if (!enemyName) return null;

  // 精确匹配
  if (enemyName in ENEMY_SIN_TALENTS) {
    return ENEMY_SIN_TALENTS[enemyName];
  }

  // 包含匹配
  for (const [key, value] of Object.entries(ENEMY_SIN_TALENTS)) {
    if (enemyName.includes(key)) {
      return value;
    }
  }

  return null;
}

export interface TalentState {
  // 计数器（用于追踪次数限制的效果）
  attackCount: number; // 攻击次数
  damageReceivedCount: number; // 本回合受到伤害次数
  damageReceivedCountInBattle: number; // 本次性斗受到伤害次数
  bindReceivedCount: number; // 受到束缚次数
  consecutiveHits: number; // 连续命中次数
  accumulatedPleasureDamage: number; // 累计受到的快感伤害
  accumulatedStaminaConsume: number; // 累计消耗的耐力
  // 状态标记
  hasShield: boolean; // 是否有护盾
  shieldTurnsRemaining: number; // 护盾剩余回合
  shieldValue: number; // 护盾减伤值
  nextAttackBoost: number; // 下次攻击加成
  dodgeBoostActive: boolean; // 闪避后攻击加成是否激活

  // ==================== 七宗罪状态 ====================
  // 色欲
  lustCharmSuccessCount: number; // 魅惑成功次数（用于计算忍耐力惩罚）
  lustCharmFailCount: number; // 连续魅惑失败次数
  lustEnemyGuaranteedCrit: boolean; // 敌人下次攻击必中且暴击
  // 暴怒
  wrathActive: boolean; // 暴怒状态是否激活
  wrathDealtDamageThisTurn: boolean; // 本回合是否造成了伤害（与暴食共用逻辑）
  // 嫉妒
  envyApplied: boolean; // 嫉妒效果是否已应用
  // 懒惰
  slothStacks: number; // 怠惰积蓄层数（0-3）
  slothCannotAttackTurns: number; // 剩余不能攻击的回合数
  slothDebuffTurns: number; // 懒散状态剩余回合
  // 傲慢
  prideConsecutiveCrits: number; // 连续暴击回合数
  prideCritThisTurn: boolean; // 本回合是否暴击
  prideAbsoluteConfidence: boolean; // 绝对自信状态
  prideShaken: boolean; // 动摇状态
  prideShakenTurns: number; // 动摇剩余回合
  // 暴食
  gluttonyStacks: number; // 饕餮层数（0-5）
  gluttonyDealtDamageThisTurn: boolean; // 本回合是否造成了伤害
  gluttonyOvereatNext: boolean; // 下回合进入过食状态
  // 贪婪
  greedStacks: number; // 贪婪层数（0-5）
}

// 创建默认天赋状态
export function createDefaultTalentState(): TalentState {
  return {
    attackCount: 0,
    damageReceivedCount: 0,
    damageReceivedCountInBattle: 0,
    bindReceivedCount: 0,
    consecutiveHits: 0,
    accumulatedPleasureDamage: 0,
    accumulatedStaminaConsume: 0,
    hasShield: false,
    shieldTurnsRemaining: 0,
    shieldValue: 0,
    nextAttackBoost: 0,
    dodgeBoostActive: false,
    // 七宗罪状态初始化
    lustCharmSuccessCount: 0,
    lustCharmFailCount: 0,
    lustEnemyGuaranteedCrit: false,
    wrathActive: false,
    wrathDealtDamageThisTurn: false,
    envyApplied: false,
    slothStacks: 0,
    slothCannotAttackTurns: 0,
    slothDebuffTurns: 0,
    prideConsecutiveCrits: 0,
    prideCritThisTurn: false,
    prideAbsoluteConfidence: false,
    prideShaken: false,
    prideShakenTurns: 0,
    gluttonyStacks: 0,
    gluttonyDealtDamageThisTurn: false,
    gluttonyOvereatNext: false,
    greedStacks: 0,
  };
}

// 天赋效果处理器接口
export interface TalentEffectContext {
  playerPleasure: number;
  playerMaxPleasure: number;
  playerStamina: number;
  playerMaxStamina: number;
  enemyPleasure: number;
  enemyMaxPleasure: number;
  enemyStamina: number;
  enemyMaxStamina: number;
  currentTurn: number;
  talentState: TalentState;
  // 回调函数
  modifyPlayerPleasure: (delta: number) => void;
  modifyPlayerStamina: (delta: number) => void;
  modifyEnemyPleasure: (delta: number) => void;
  modifyEnemyStamina: (delta: number) => void;
  addLog: (message: string, source: string, type: string) => void;
  applyBuff: (target: 'player' | 'enemy', buffName: string, bonus: Record<string, number>, duration: number) => void;
}

// 天赋效果结果
export interface TalentEffectResult {
  damageMultiplier?: number; // 伤害倍率修正
  damageReduction?: number; // 伤害减免（固定值）
  damageReductionPercent?: number; // 伤害减免（百分比）
  accuracyBoost?: number; // 命中率加成
  guaranteedHit?: boolean; // 必定命中
  guaranteedCrit?: boolean; // 必定暴击
  reflectDamage?: number; // 反弹伤害
  preventClimaxCount?: boolean; // 阻止高潮计数
  preventBind?: boolean; // 阻止束缚
  addBind?: boolean; // 附加束缚
  bindDuration?: number; // 束缚持续回合
  skipEffect?: boolean; // 跳过本次效果
  message?: string; // 日志消息
  // 七宗罪特殊效果
  extraHitCount?: number; // 额外连击次数
  critDamageMultiplier?: number; // 暴击伤害倍率（贪婪3层以上为300%）
  charmEnemy?: boolean; // 魅惑敌人
  cannotAttack?: boolean; // 无法攻击
  cannotUseItems?: boolean; // 无法使用道具
  cannotSurrender?: boolean; // 无法投降
  selfPleasureIncrease?: number; // 自身快感增加
  selfPleasureDecrease?: number; // 自身快感减少
  bindDurationExtend?: number; // 束缚持续时间延长
}

// 处理回合开始时的天赋效果
export function processTalentOnTurnStart(talent: TalentData | null, context: TalentEffectContext): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'turn_start') continue;

    switch (effect.effect) {
      case 'reduce_pleasure_when_high': {
        // 当快感超过阈值时减少快感
        const threshold = (effect.params.threshold || 50) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          const reduction = effect.params.value || 5;
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${reduction}点`, 'system', 'info');
        }
        break;
      }

      case 'reduce_pleasure_when_low': {
        // 当快感低于阈值时减少快感
        const threshold = (effect.params.threshold || 25) / 100;
        if (context.playerPleasure < context.playerMaxPleasure * threshold) {
          const reduction = effect.params.value || 10;
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${reduction}点`, 'system', 'info');
        }
        break;
      }

      case 'balance_pleasure': {
        // 快感向目标值调整
        const targetPercent = (effect.params.threshold || 50) / 100;
        const targetPleasure = context.playerMaxPleasure * targetPercent;
        const adjustValue = effect.params.value || 20;

        if (context.playerPleasure > targetPleasure) {
          const reduction = Math.min(adjustValue, context.playerPleasure - targetPleasure);
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${Math.floor(reduction)}点`, 'system', 'info');
        } else if (context.playerPleasure < targetPleasure) {
          const increase = Math.min(adjustValue, targetPleasure - context.playerPleasure);
          context.modifyPlayerPleasure(increase);
          context.addLog(`【${talent.name}】触发：快感增加${Math.floor(increase)}点`, 'system', 'info');
        }
        break;
      }

      case 'random_buff_every_n_turns': {
        // 每N回合获得随机buff
        const interval = effect.params.count || 3;
        if (context.currentTurn > 0 && context.currentTurn % interval === 0) {
          const buffs: Array<{ name: string; bonus: Record<string, number> }> = [
            { name: '性斗力提升', bonus: { 基础性斗力成算: 15 } },
            { name: '忍耐力提升', bonus: { 基础忍耐力成算: 15 } },
            { name: '闪避提升', bonus: { 闪避率加成: 10 } },
            { name: '暴击提升', bonus: { 暴击率加成: 10 } },
          ];
          const randomBuff = buffs[Math.floor(Math.random() * buffs.length)];
          const duration = effect.params.duration || 2;
          context.applyBuff('player', `天赋_${randomBuff.name}`, randomBuff.bonus, duration);
          context.addLog(`【${talent.name}】触发：获得${randomBuff.name}效果（${duration}回合）`, 'system', 'info');
        }
        break;
      }
    }
  }

  // 重置回合内计数器
  context.talentState.damageReceivedCount = 0;

  return result;
}

// 处理回合结束时的天赋效果
export function processTalentOnTurnEnd(talent: TalentData | null, context: TalentEffectContext): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'turn_end') continue;

    switch (effect.effect) {
      case 'boost_stamina_recovery': {
        // 耐力回复量增加（这个效果需要在实际回复时应用）
        // 这里只是标记，实际处理在耐力回复逻辑中
        break;
      }

      case 'recover_stamina_per_turn': {
        const value = effect.params.value || 2;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        break;
      }

      case 'reduce_pleasure_per_turn': {
        const value = effect.params.value || 3;
        context.modifyPlayerPleasure(-value);
        context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        break;
      }
    }
  }

  // 护盾回合递减
  if (context.talentState.hasShield && context.talentState.shieldTurnsRemaining > 0) {
    context.talentState.shieldTurnsRemaining--;
    if (context.talentState.shieldTurnsRemaining <= 0) {
      context.talentState.hasShield = false;
      context.talentState.shieldValue = 0;
      context.addLog(`【护盾】效果已结束`, 'system', 'info');
    }
  }

  return result;
}

// 处理战斗开始时的天赋效果
export function processTalentOnBattleStart(
  talent: TalentData | null,
  context: TalentEffectContext,
): TalentEffectResult {
  if (!talent) return {};

  // 重置天赋状态
  Object.assign(context.talentState, createDefaultTalentState());

  for (const effect of talent.effects) {
    if (effect.trigger !== 'battle_start') continue;

    switch (effect.effect) {
      case 'reset_stats_on_battle_start': {
        // 回满耐力，清空快感
        const staminaToRecover = context.playerMaxStamina - context.playerStamina;
        const pleasureToReduce = context.playerPleasure;
        context.modifyPlayerStamina(staminaToRecover);
        context.modifyPlayerPleasure(-pleasureToReduce);
        context.addLog(`【${talent.name}】触发：耐力回满，快感清空`, 'system', 'info');
        break;
      }

      case 'shield_first_n_turns': {
        context.talentState.hasShield = true;
        context.talentState.shieldTurnsRemaining = effect.params.duration || 3;
        context.talentState.shieldValue = effect.params.value || 5;
        context.addLog(
          `【${talent.name}】触发：获得护盾（${context.talentState.shieldTurnsRemaining}回合）`,
          'system',
          'info',
        );
        break;
      }

      case 'bonus_stamina_on_start': {
        const value = effect.params.value || 15;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：获得${value}点额外耐力`, 'system', 'info');
        break;
      }
    }
  }

  return {};
}

// 处理攻击时的天赋效果
export function processTalentOnAttack(
  talent: TalentData | null,
  context: TalentEffectContext,
  hasBindEffect: boolean,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};
  context.talentState.attackCount++;

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_attack') continue;

    switch (effect.effect) {
      case 'double_first_n_attacks': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count) {
          result.damageMultiplier = (result.damageMultiplier || 1) * (effect.params.multiplier || 2);
          context.addLog(`【${talent.name}】触发：伤害翻倍！`, 'system', 'critical');
        }
        break;
      }

      case 'guaranteed_hit_first_n': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count) {
          result.guaranteedHit = true;
          context.addLog(`【${talent.name}】触发：必定命中！`, 'system', 'info');
        }
        break;
      }

      case 'add_bind_first_n': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count && !hasBindEffect) {
          result.addBind = true;
          result.bindDuration = effect.params.duration || 1;
          context.addLog(`【${talent.name}】触发：附加束缚效果！`, 'system', 'info');
        }
        break;
      }

      case 'reduce_enemy_dodge_chance': {
        const chance = effect.params.chance || 15;
        if (Math.random() * 100 < chance) {
          const value = effect.params.value || 20;
          const duration = effect.params.duration || 1;
          context.applyBuff('enemy', '天赋_闪避降低', { 闪避率加成: -value }, duration);
          context.addLog(`【${talent.name}】触发：敌人闪避率降低${value}%`, 'system', 'info');
        }
        break;
      }
    }
  }

  // 处理闪避后攻击加成
  if (context.talentState.dodgeBoostActive && context.talentState.nextAttackBoost > 0) {
    result.damageMultiplier = (result.damageMultiplier || 1) * (1 + context.talentState.nextAttackBoost / 100);
    context.addLog(`【闪避大师】触发：伤害提升${context.talentState.nextAttackBoost}%`, 'system', 'info');
    context.talentState.dodgeBoostActive = false;
    context.talentState.nextAttackBoost = 0;
  }

  return result;
}

// 处理造成伤害时的天赋效果
export function processTalentOnDamageDealt(
  talent: TalentData | null,
  context: TalentEffectContext,
  damageDealt: number,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_damage_deal') continue;

    switch (effect.effect) {
      case 'reduce_self_pleasure_on_attack': {
        const value = effect.params.value || 3;
        context.modifyPlayerPleasure(-value);
        context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        break;
      }

      case 'drain_enemy_stamina': {
        const chance = effect.params.chance || 25;
        if (Math.random() * 100 < chance) {
          const value = effect.params.value || 3;
          context.modifyEnemyStamina(-value);
          context.addLog(`【${talent.name}】触发：消耗敌人${value}点耐力`, 'system', 'info');
        }
        break;
      }
    }
  }

  // 连续命中计数
  context.talentState.consecutiveHits++;

  return result;
}

// 处理受到伤害时的天赋效果
export function processTalentOnDamageReceived(
  talent: TalentData | null,
  context: TalentEffectContext,
  incomingDamage: number,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};
  context.talentState.damageReceivedCount++;
  context.talentState.damageReceivedCountInBattle++;

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_damage_receive') continue;

    switch (effect.effect) {
      case 'cap_pleasure_damage': {
        // 单次伤害上限
        const threshold = (effect.params.threshold || 30) / 100;
        const maxDamage = Math.floor(context.playerMaxPleasure * threshold);
        if (incomingDamage > maxDamage) {
          result.damageReduction = incomingDamage - maxDamage;
          context.addLog(`【${talent.name}】触发：伤害被限制为${maxDamage}点`, 'system', 'info');
        }
        break;
      }

      case 'reflect_pleasure_damage': {
        const reflectPercent = (effect.params.value || 25) / 100;
        result.reflectDamage = Math.floor(incomingDamage * reflectPercent);
        if (result.reflectDamage > 0) {
          context.modifyEnemyPleasure(result.reflectDamage);
          context.addLog(`【${talent.name}】触发：反弹${result.reflectDamage}点伤害`, 'system', 'info');
        }
        break;
      }

      case 'reduce_pleasure_damage': {
        const reductionPercent = effect.params.value || 15;
        result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
        break;
      }

      case 'reduce_first_n_damage': {
        const count = effect.params.count || 2;
        if (context.talentState.damageReceivedCountInBattle <= count) {
          const reductionPercent = effect.params.value || 50;
          result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
          context.addLog(`【${talent.name}】触发：伤害减少${reductionPercent}%`, 'system', 'info');
        }
        break;
      }

      case 'reduce_first_damage_per_turn': {
        if (context.talentState.damageReceivedCount === 1) {
          const value = effect.params.value || 8;
          result.damageReduction = (result.damageReduction || 0) + value;
          context.addLog(`【${talent.name}】触发：伤害减少${value}点`, 'system', 'info');
        }
        break;
      }

      case 'convert_pleasure_to_stamina': {
        context.talentState.accumulatedPleasureDamage += incomingDamage;
        const threshold = effect.params.threshold || 15;
        const value = effect.params.value || 3;
        while (context.talentState.accumulatedPleasureDamage >= threshold) {
          context.talentState.accumulatedPleasureDamage -= threshold;
          context.modifyPlayerStamina(value);
          context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        }
        break;
      }

      case 'reduce_damage_when_high_pleasure': {
        const threshold = (effect.params.threshold || 80) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          const reductionPercent = effect.params.value || 25;
          result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
          context.addLog(`【${talent.name}】触发：伤害减少${reductionPercent}%`, 'system', 'info');
        }
        break;
      }

      case 'chance_immune_attack': {
        const chance = effect.params.chance || 10;
        if (Math.random() * 100 < chance) {
          result.skipEffect = true;
          context.addLog(`【${talent.name}】触发：完全免疫攻击！`, 'system', 'critical');
        }
        break;
      }
    }
  }

  // 护盾减伤
  if (context.talentState.hasShield && context.talentState.shieldValue > 0) {
    result.damageReduction = (result.damageReduction || 0) + context.talentState.shieldValue;
  }

  return result;
}

// 处理闪避时的天赋效果
export function processTalentOnDodge(talent: TalentData | null, context: TalentEffectContext): TalentEffectResult {
  if (!talent) return {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_dodge') continue;

    switch (effect.effect) {
      case 'boost_next_attack_on_dodge': {
        const value = effect.params.value || 15;
        context.talentState.nextAttackBoost = value;
        context.talentState.dodgeBoostActive = true;
        context.addLog(`【${talent.name}】触发：下次攻击伤害+${value}%`, 'system', 'info');
        break;
      }
    }
  }

  return {};
}

// 处理暴击时的天赋效果
export function processTalentOnCrit(
  talent: TalentData | null,
  context: TalentEffectContext,
  baseDamage: number,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_crit') continue;

    switch (effect.effect) {
      case 'boost_crit_damage': {
        const value = effect.params.value || 25;
        result.damageMultiplier = (result.damageMultiplier || 1) * (1 + value / 100);
        context.addLog(`【${talent.name}】触发：暴击伤害+${value}%`, 'system', 'critical');
        break;
      }
    }
  }

  return result;
}

// 处理受到暴击时的天赋效果
export function processTalentOnCritReceived(
  talent: TalentData | null,
  context: TalentEffectContext,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_crit_receive') continue;

    switch (effect.effect) {
      case 'reduce_crit_damage_received': {
        const value = effect.params.value || 20;
        result.damageReductionPercent = (result.damageReductionPercent || 0) + value;
        context.addLog(`【${talent.name}】触发：暴击伤害减少${value}%`, 'system', 'info');
        break;
      }
    }
  }

  return result;
}

// 处理高潮时的天赋效果
export function processTalentOnClimax(talent: TalentData | null, context: TalentEffectContext): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_climax') continue;

    switch (effect.effect) {
      case 'chance_ignore_climax_count': {
        const chance = effect.params.chance || 30;
        if (Math.random() * 100 < chance) {
          result.preventClimaxCount = true;
          context.addLog(`【${talent.name}】触发：本次高潮不计入次数！`, 'system', 'critical');
        }
        break;
      }
    }
  }

  return result;
}

// 处理敌人高潮时的天赋效果
export function processTalentOnEnemyClimax(
  talent: TalentData | null,
  context: TalentEffectContext,
): TalentEffectResult {
  if (!talent) return {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_enemy_climax') continue;

    switch (effect.effect) {
      case 'recover_stamina_on_enemy_climax': {
        const value = effect.params.value || 20;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        break;
      }
    }
  }

  return {};
}

// 处理受到debuff时的天赋效果
export function processTalentOnDebuffReceived(
  talent: TalentData | null,
  context: TalentEffectContext,
  debuffType: string,
): TalentEffectResult {
  if (!talent) return {};

  const result: TalentEffectResult = {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_debuff_receive') continue;

    switch (effect.effect) {
      case 'immune_first_n_binds': {
        if (debuffType === 'bind') {
          const count = effect.params.count || 2;
          context.talentState.bindReceivedCount++;
          if (context.talentState.bindReceivedCount <= count) {
            result.preventBind = true;
            context.addLog(`【${talent.name}】触发：免疫束缚效果！`, 'system', 'info');
          }
        }
        break;
      }
    }
  }

  return result;
}

// 处理耐力消耗时的天赋效果
export function processTalentOnStaminaConsume(
  talent: TalentData | null,
  context: TalentEffectContext,
  staminaConsumed: number,
): TalentEffectResult {
  if (!talent) return {};

  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_stamina_consume') continue;

    switch (effect.effect) {
      case 'convert_stamina_to_pleasure_reduce': {
        context.talentState.accumulatedStaminaConsume += staminaConsumed;
        const threshold = effect.params.threshold || 8;
        const value = effect.params.value || 2;
        while (context.talentState.accumulatedStaminaConsume >= threshold) {
          context.talentState.accumulatedStaminaConsume -= threshold;
          context.modifyPlayerPleasure(-value);
          context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        }
        break;
      }
    }
  }

  return {};
}

// 获取被动效果的属性修正
export function getTalentPassiveModifiers(
  talent: TalentData | null,
  context: {
    playerPleasure: number;
    playerMaxPleasure: number;
    playerStamina: number;
    playerMaxStamina: number;
    enemyPleasure: number;
    enemyMaxPleasure: number;
  },
): {
  damageBoostPercent: number;
  accuracyBoost: number;
  dodgeBoost: number;
  critBoost: number;
  allStatsBoostPercent: number;
  enemyDodgeReduction: number;
  chanceBoost: number;
  powerCoeffBoost: number;
} {
  const result = {
    damageBoostPercent: 0,
    accuracyBoost: 0,
    dodgeBoost: 0,
    critBoost: 0,
    allStatsBoostPercent: 0,
    enemyDodgeReduction: 0,
    chanceBoost: 0,
    powerCoeffBoost: 0,
  };

  if (!talent) return result;

  for (const effect of talent.effects) {
    if (effect.trigger !== 'passive') continue;

    switch (effect.effect) {
      case 'power_boost_when_high_pleasure': {
        const threshold = (effect.params.threshold || 75) / 100;
        if (context.playerPleasure >= context.playerMaxPleasure * threshold) {
          result.powerCoeffBoost += effect.params.value || 40;
        }
        break;
      }

      case 'damage_boost_when_low_stamina': {
        const threshold = (effect.params.threshold || 30) / 100;
        if (context.playerStamina < context.playerMaxStamina * threshold) {
          result.damageBoostPercent += effect.params.value || 20;
        }
        break;
      }

      case 'damage_boost_when_enemy_high_pleasure': {
        const threshold = (effect.params.threshold || 70) / 100;
        if (context.enemyPleasure > context.enemyMaxPleasure * threshold) {
          result.damageBoostPercent += effect.params.value || 30;
        }
        break;
      }

      case 'boost_accuracy': {
        result.accuracyBoost += effect.params.value || 10;
        break;
      }

      case 'boost_all_stats_when_critical': {
        const threshold = (effect.params.threshold || 90) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          result.allStatsBoostPercent += effect.params.value || 10;
        }
        break;
      }

      case 'reduce_enemy_dodge': {
        result.enemyDodgeReduction += effect.params.value || 5;
        break;
      }

      case 'boost_all_chances': {
        result.chanceBoost += effect.params.value || 5;
        break;
      }

      case 'boost_dodge_when_low_stamina': {
        const threshold = (effect.params.threshold || 20) / 100;
        if (context.playerStamina < context.playerMaxStamina * threshold) {
          result.dodgeBoost += effect.params.value || 15;
        }
        break;
      }
    }
  }

  return result;
}

// 获取耐力回复倍率
export function getTalentStaminaRecoveryMultiplier(talent: TalentData | null): number {
  if (!talent) return 1;

  for (const effect of talent.effects) {
    if (effect.trigger === 'turn_end' && effect.effect === 'boost_stamina_recovery') {
      return effect.params.multiplier || 1.3;
    }
  }

  return 1;
}

// 获取耐力变化上限
export function getTalentStaminaChangeCap(talent: TalentData | null): number | null {
  if (!talent) return null;

  for (const effect of talent.effects) {
    if (effect.trigger === 'on_stamina_change' && effect.effect === 'cap_stamina_change') {
      return effect.params.maxValue || 30;
    }
  }

  return null;
}

// ==================== 七宗罪天赋专用函数 ====================

/**
 * 检查是否拥有七宗罪天赋
 */
export function hasSinTalent(talent: TalentData | null): boolean {
  return talent?.rarity === 'SIN';
}

/**
 * 获取七宗罪天赋类型
 */
export function getSinTalentType(talent: TalentData | null): string | null {
  if (!talent || talent.rarity !== 'SIN') return null;

  const sinTypes: Record<string, string> = {
    talent_sin_lust: 'lust',
    talent_sin_wrath: 'wrath',
    talent_sin_envy: 'envy',
    talent_sin_sloth: 'sloth',
    talent_sin_pride: 'pride',
    talent_sin_gluttony: 'gluttony',
    talent_sin_greed: 'greed',
  };

  return sinTypes[talent.id] || null;
}

/**
 * 检查七宗罪天赋是否禁用道具
 */
export function sinTalentDisablesItems(talent: TalentData | null): boolean {
  const sinType = getSinTalentType(talent);
  // 暴怒、暴食、贪婪、傲慢禁用道具
  return ['wrath', 'gluttony', 'greed', 'pride'].includes(sinType || '');
}

/**
 * 检查七宗罪天赋是否禁用投降
 */
export function sinTalentDisablesSurrender(talent: TalentData | null): boolean {
  const sinType = getSinTalentType(talent);
  // 暴怒、贪婪、傲慢禁用投降
  return ['wrath', 'greed', 'pride'].includes(sinType || '');
}

/**
 * 处理七宗罪-色欲的魅惑效果
 * @returns 魅惑是否成功
 */
export function processLustCharm(
  context: TalentEffectContext,
  playerCharm: number,
  enemyCharm: number,
): {
  success: boolean;
  message: string;
  bindEnemy?: boolean;
  bindDuration?: number;
  selfEnduranceDebuff?: number;
  enemyGuaranteedHitCrit?: boolean;
} {
  // 魅惑成功率 = 30% + (玩家魅力 - 敌人魅力) / 10
  const charmChance = 35 + (playerCharm - enemyCharm) / 10;
  const roll = Math.random() * 100;
  const success = roll < charmChance;

  if (success) {
    context.talentState.lustCharmSuccessCount++;
    context.talentState.lustCharmFailCount = 0;
    return {
      success: true,
      bindEnemy: true, // 束缚敌人1回合
      bindDuration: 1,
      selfEnduranceDebuff: -12 * context.talentState.lustCharmSuccessCount, // 自身忍耐力成算-12%（可叠加）
      message: `魅惑成功！（概率=${Math.round(charmChance)}%）敌人被束缚1回合。自身忍耐力成算-12%（已叠加${context.talentState.lustCharmSuccessCount}次）`,
    };
  } else {
    context.talentState.lustCharmFailCount++;
    if (context.talentState.lustCharmFailCount >= 2) {
      context.talentState.lustEnemyGuaranteedCrit = true;
      context.talentState.lustCharmFailCount = 0;
      return {
        success: false,
        bindEnemy: false,
        enemyGuaranteedHitCrit: true, // 标记敌人下次必中必暴
        message: `魅惑失败！（概率=${Math.round(charmChance)}%）连续失败2次，敌人下次攻击必定命中且暴击！`,
      };
    }
    return {
      success: false,
      bindEnemy: false,
      message: `魅惑失败（概率=${Math.round(charmChance)}%，连续失败${context.talentState.lustCharmFailCount}次）`,
    };
  }
}

/**
 * 处理七宗罪-暴怒的效果修正
 * 暴怒天赋始终生效：连击+1，无法使用道具和投降
 */
export function getWrathModifiers(_talentState: TalentState): TalentEffectResult {
  // 暴怒天赋始终激活（不需要检查wrathActive）
  return {
    extraHitCount: 1, // 连击+1
    cannotUseItems: true, // 无法使用道具
    cannotSurrender: true, // 无法投降
  };
}

/**
 * 处理七宗罪-嫉妒的战斗开始效果
 */
export function processEnvyOnBattleStart(
  context: TalentEffectContext,
  playerStats: { sexPower: number; endurance: number; crit: number; evasion: number; charm: number; luck: number },
  enemyStats: { sexPower: number; endurance: number; crit: number; evasion: number; charm: number; luck: number },
): { effects: Array<{ attribute: string; value: number; isBonus: boolean; message: string }> } {
  const statKeys: Array<keyof typeof playerStats> = ['sexPower', 'endurance', 'crit', 'evasion', 'charm', 'luck'];
  const statNames: Record<string, string> = {
    sexPower: '基础性斗力',
    endurance: '基础忍耐力',
    crit: '暴击率',
    evasion: '闪避率',
    charm: '魅力',
    luck: '幸运',
  };

  // 随机选择3个属性
  const shuffled = [...statKeys].sort(() => Math.random() - 0.5);
  const selectedStats = shuffled.slice(0, 3);

  const effects: Array<{ attribute: string; value: number; isBonus: boolean; message: string }> = [];

  for (const stat of selectedStats) {
    const playerValue = playerStats[stat];
    const enemyValue = enemyStats[stat];
    const displayName = statNames[stat];

    if (enemyValue > playerValue) {
      // 对手属性高于自身，自身+80%对手值
      const boost = Math.floor(enemyValue * 0.8);
      effects.push({
        attribute: displayName,
        value: boost,
        isBonus: true,
        message: `${displayName}：对手(${enemyValue}) > 自身(${playerValue})，${displayName}+${boost}`,
      });
    } else {
      // 对手属性低于或等于自身，自身-50%对手值（减少debuff惩罚）
      const penalty = Math.floor(enemyValue * 0.5);
      effects.push({
        attribute: displayName,
        value: -penalty,
        isBonus: false,
        message: `${displayName}：对手(${enemyValue}) ≤ 自身(${playerValue})，${displayName}-${penalty}`,
      });
    }
  }

  context.talentState.envyApplied = true;
  return { effects };
}

/**
 * 处理七宗罪-懒惰的跳过回合效果
 */
export function processSlothSkipTurn(context: TalentEffectContext): { message: string } {
  if (context.talentState.slothStacks < 3) {
    context.talentState.slothStacks++;
    return {
      message: `【七宗罪·懒惰】获得1层"怠惰积蓄"（当前${context.talentState.slothStacks}层）：性斗力/忍耐力成算+${context.talentState.slothStacks * 10}%、闪避率+${context.talentState.slothStacks * 5}%`,
    };
  }
  return { message: `【七宗罪·懒惰】怠惰积蓄已达上限（3层）` };
}

/**
 * 获取七宗罪-懒惰的攻击效果
 */
export function getSlothAttackModifiers(talentState: TalentState, currentTurn: number): TalentEffectResult {
  const result: TalentEffectResult = {};

  // 前3回合无法攻击
  if (talentState.slothCannotAttackTurns > 0) {
    result.cannotAttack = true;
    return result;
  }

  // 消耗积蓄获得效果
  const stacks = talentState.slothStacks;
  if (stacks >= 1) {
    result.guaranteedCrit = true;
  }
  if (stacks >= 2) {
    result.guaranteedHit = true;
  }
  if (stacks >= 3) {
    result.extraHitCount = 2;
  }

  return result;
}

/**
 * 处理七宗罪-懒惰使用技能后的效果
 */
export function processSlothAfterAttack(context: TalentEffectContext): { message: string } {
  const stacks = context.talentState.slothStacks;
  context.talentState.slothStacks = 0;
  context.talentState.slothDebuffTurns = 2;

  return {
    message: `【七宗罪·懒惰】消耗${stacks}层怠惰积蓄，进入"懒散"状态2回合（性斗力成算-20%、闪避率-15%）`,
  };
}

/**
 * 获取七宗罪-傲慢的属性对比修正
 */
export function getPrideStatModifiers(
  playerStats: { sexPower: number; endurance: number; charm: number; luck: number },
  enemyStats: { sexPower: number; endurance: number; charm: number; luck: number },
): { boosts: string[]; penalties: string[]; totalBoostPercent: number; totalPenaltyPercent: number } {
  const stats: Array<keyof typeof playerStats> = ['sexPower', 'endurance', 'charm', 'luck'];
  const statNames: Record<string, string> = {
    sexPower: '性斗力',
    endurance: '忍耐力',
    charm: '魅力',
    luck: '幸运',
  };

  const boosts: string[] = [];
  const penalties: string[] = [];
  let totalBoostPercent = 0;
  let totalPenaltyPercent = 0;

  for (const stat of stats) {
    if (playerStats[stat] > enemyStats[stat]) {
      boosts.push(statNames[stat]);
      totalBoostPercent += 20;
    } else if (playerStats[stat] < enemyStats[stat]) {
      penalties.push(statNames[stat]);
      totalPenaltyPercent += 20;
    }
  }

  return { boosts, penalties, totalBoostPercent, totalPenaltyPercent };
}

/**
 * 处理七宗罪-暴食的受伤效果
 */
export function processGluttonyOnDamageReceived(context: TalentEffectContext): {
  message: string;
  bindNextTurn: boolean;
} {
  if (context.talentState.gluttonyStacks < 5) {
    context.talentState.gluttonyStacks++;
  }

  const stacks = context.talentState.gluttonyStacks;
  let bindNextTurn = false;
  let message = `【七宗罪·暴食】获得1层「饕餮」（当前${stacks}层）：性斗力/忍耐力成算+${stacks * 10}、暴击率+${stacks * 5}%`;

  if (stacks >= 5) {
    context.talentState.gluttonyOvereatNext = true;
    message += `\n警告：饕餮层数达到5层，下回合将进入「过食」状态！`;
    bindNextTurn = true;
  }

  return { message, bindNextTurn };
}

/**
 * 处理七宗罪-暴食的造成伤害效果
 */
export function processGluttonyOnDamageDealt(
  context: TalentEffectContext,
  maxPleasure: number,
): { pleasureReduction: number; message: string } {
  context.talentState.gluttonyDealtDamageThisTurn = true;
  const reduction = Math.floor(maxPleasure * 0.1);
  return {
    pleasureReduction: reduction,
    message: `【七宗罪·暴食】造成伤害，自身快感-${reduction}`,
  };
}

/**
 * 处理七宗罪-贪婪的回合开始效果
 */
export function processGreedOnTurnStart(
  context: TalentEffectContext,
  currentStamina: number,
): { staminaCost: number; message: string } {
  if (context.talentState.greedStacks >= 5) {
    return { staminaCost: 0, message: `【七宗罪·贪婪】贪婪层数已达上限（5层）` };
  }

  const staminaCost = Math.floor(currentStamina * 0.1);
  context.talentState.greedStacks++;

  const stacks = context.talentState.greedStacks;
  let message = `【七宗罪·贪婪】消耗${staminaCost}耐力，获得1层「贪婪」（当前${stacks}层）：暴击率+${stacks * 10}%、魅力+${stacks * 30}、幸运+${stacks * 30}、性斗力成算+${stacks * 15}%`;

  if (stacks >= 3) {
    message += `\n暴击伤害提升至300%！`;
  }
  message += `\n闪避率-${stacks * 10}%`;

  return { staminaCost, message };
}

/**
 * 处理七宗罪-贪婪的跳过回合效果
 */
export function processGreedSkipTurn(
  context: TalentEffectContext,
  maxPleasure: number,
): { pleasureIncrease: number; message: string } {
  if (context.talentState.greedStacks > 0) {
    const stacks = context.talentState.greedStacks;
    const pleasureIncrease = Math.floor(maxPleasure * stacks * 0.05);
    // 跳过回合失去2层贪婪
    context.talentState.greedStacks = Math.max(0, context.talentState.greedStacks - 2);
    return {
      pleasureIncrease,
      message: `【七宗罪·贪婪】跳过回合，失去2层贪婪（剩余${context.talentState.greedStacks}层），快感+${pleasureIncrease}`,
    };
  }
  return { pleasureIncrease: 0, message: '' };
}

/**
 * 获取七宗罪-贪婪的暴击伤害倍率
 */
export function getGreedCritDamageMultiplier(talentState: TalentState): number {
  // 3层以上时暴击伤害从150%提升至300%
  if (talentState.greedStacks >= 3) {
    return 3.0; // 300%
  }
  return 1.5; // 默认150%
}

/**
 * 获取七宗罪-贪婪的束缚延长回合数
 */
export function getGreedBindExtension(talentState: TalentState): number {
  // 当拥有贪婪层数时，受到的束缚持续时间+1回合
  return talentState.greedStacks > 0 ? 1 : 0;
}

/**
 * 获取七宗罪天赋的被动属性修正（用于战斗计算）
 */
export function getSinTalentPassiveModifiers(
  talent: TalentData | null,
  talentState: TalentState,
): {
  sexPowerPercent: number;
  endurancePercent: number;
  critBoost: number;
  evasionBoost: number;
  charmBoost: number;
  luckBoost: number;
  extraHitCount: number;
} {
  const result = {
    sexPowerPercent: 0,
    endurancePercent: 0,
    critBoost: 0,
    evasionBoost: 0,
    charmBoost: 0,
    luckBoost: 0,
    extraHitCount: 0,
  };

  const sinType = getSinTalentType(talent);
  if (!sinType) return result;

  switch (sinType) {
    case 'wrath':
      // 暴怒：闪避率-999%（已在bonus中），连击+1
      result.evasionBoost = -999;
      result.extraHitCount = 1;
      break;

    case 'sloth':
      // 懒惰：每层怠惰积蓄提供性斗力/忍耐力成算+10%、闪避率+5%
      const slothStacks = talentState.slothStacks;
      result.sexPowerPercent = slothStacks * 10;
      result.endurancePercent = slothStacks * 10;
      result.evasionBoost = slothStacks * 5;
      // 懒散状态时的debuff
      if (talentState.slothDebuffTurns > 0) {
        result.sexPowerPercent -= 20;
        result.evasionBoost -= 15;
      }
      break;

    case 'gluttony':
      // 暴食：每层饕餮提供性斗力/忍耐力成算+10、暴击率+5%
      const gluttonyStacks = talentState.gluttonyStacks;
      result.sexPowerPercent = gluttonyStacks * 10;
      result.endurancePercent = gluttonyStacks * 10;
      result.critBoost = gluttonyStacks * 5;
      break;

    case 'greed':
      // 贪婪：每层提供暴击率+10%、魅力+30、幸运+30、性斗力成算+15%，闪避率-10%
      const greedStacks = talentState.greedStacks;
      result.critBoost = greedStacks * 10;
      result.charmBoost = greedStacks * 30;
      result.luckBoost = greedStacks * 30;
      result.sexPowerPercent = greedStacks * 15;
      result.evasionBoost = -greedStacks * 10;
      break;
  }

  return result;
}
