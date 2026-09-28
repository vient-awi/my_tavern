import { compare } from 'compare-versions';
import { checkMinimumVersion } from '../../../util/common';

const CHARACTER_NAME = '性斗学园超级重制版';
const WORLDBOOK_NAME = '性斗学园';
const VERSION_ENTRY_NAME = '版本号';
const GITHUB_BASE_URL = 'https://raw.githack.com/vincentrong2005/Fatria/main/src/性斗学园';

// 检查酒馆助手最低版本
checkMinimumVersion('4.6.2', CHARACTER_NAME);

/**
 * 检查上游是否有新版角色卡。
 *
 * 本分支为「全员性转」改版，**只检测、不拉取** —— 自动导入上游角色卡会
 * 覆盖性转成果。检测到新版时仅提示，是否同步由你手动决定。
 *
 * 世界书/角色卡的同步流程后续单独搭建，参见「自动更新链路风险说明.md」。
 */
export async function checkUpdate() {
  const version =
    (await getWorldbook(WORLDBOOK_NAME)).find(entry => entry.name === VERSION_ENTRY_NAME)?.content.trim() ?? '0.0.0';

  const remoteVersion = await fetch(`${GITHUB_BASE_URL}/版本号.txt`)
    .then(response => response.text())
    .then(text => text.trim())
    .catch(() => '0.0.0');

  if (compare(version, remoteVersion, '>=')) {
    return;
  }

  // 原本此处会 importRawCharacter 拉取上游 .png 覆盖角色卡，现已停用。
  console.info(
    `[性斗学园] 上游角色卡已更新至 v${remoteVersion}，当前为 v${version}。本分支为性转改版，未自动拉取。`,
  );
  if (typeof toastr !== 'undefined') {
    toastr.info(
      `上游角色卡已更新至 v${remoteVersion}（当前 v${version}）。\n本分支为性转改版，未自动拉取，如需同步请手动处理。`,
      CHARACTER_NAME,
    );
  }
}

checkUpdate();
