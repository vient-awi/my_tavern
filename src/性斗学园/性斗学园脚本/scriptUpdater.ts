import { compare } from 'compare-versions';

export const SCRIPT_VERSION = '3.7.2';
export const SCRIPT_UPDATE_EVENT = 'fatria-script-update-status';

const JSDELIVR_HOST = 'cdn.jsdelivr.net';
const JSDELIVR_REPOSITORY_PATH = '/gh/vincentrong2005/Fatria';
const JSDELIVR_REPOSITORY_PREFIX = `${JSDELIVR_REPOSITORY_PATH}@`;
const SCRIPT_BUNDLE_PATH = '/dist/性斗学园/性斗学园脚本/index.js';
const SCRIPT_IMPORT_URL_PATTERN = /(\bimport\s*(?:\(\s*)?['"])(https:\/\/[^'"\s]+)(['"]\s*\)?)/g;
const SCRIPT_URL_LITERAL_PATTERN = /(^\s*['"])(https:\/\/[^'"\s]+)(['"]\s*;?\s*$)/gm;
const SCRIPT_URL_BARE_PATTERN = /(^\s*)(https:\/\/[^'"\s]+)(\s*;?\s*$)/gm;

const UPDATE_MANIFEST_URL =
  'https://raw.githubusercontent.com/vincentrong2005/Fatria/main/src/%E6%80%A7%E6%96%97%E5%AD%A6%E5%9B%AD/%E6%80%A7%E6%96%97%E5%AD%A6%E5%9B%AD%E8%84%9A%E6%9C%AC/update-manifest.json';
const UPDATE_CHECK_STORAGE_KEY = 'fatria-sex-battle-academy-script-update-v2';
const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface ScriptUpdateManifest {
  version: string;
  /** Immutable Git tag holding this exact script release, for example `v3.6.0`. */
  releaseTag: string;
  changelog?: string[];
  releases?: ScriptUpdateRelease[];
}

export interface ScriptUpdateRelease {
  version: string;
  releaseTag?: string;
  changelog: string[];
}

export interface ApplyScriptUpdateResult {
  updated: boolean;
  message: string;
  releaseTag?: string;
}

export interface ScriptUpdateState {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  isUsingMutableReference: boolean;
  status: 'idle' | 'checking' | 'available' | 'latest' | 'error';
  message: string;
  checkedAt?: number;
  manifest?: ScriptUpdateManifest;
}

interface ScriptUpdateCache {
  lastCheckedAt?: number;
  latestVersion?: string;
  dismissedVersion?: string;
  manifest?: ScriptUpdateManifest;
}

interface CheckScriptUpdateOptions {
  force?: boolean;
  silent?: boolean;
  prompt?: boolean;
}

const globalAny = globalThis as any;

let scriptUpdateState: ScriptUpdateState = {
  currentVersion: SCRIPT_VERSION,
  latestVersion: SCRIPT_VERSION,
  hasUpdate: false,
  isUsingMutableReference: false,
  status: 'idle',
  message: '尚未检查更新。',
};
let updateCheckScheduled = false;

export function getScriptUpdateState(): ScriptUpdateState {
  return cloneState(scriptUpdateState);
}

export function scheduleScriptUpdateCheck(delayMs = 4000): void {
  if (updateCheckScheduled) return;
  updateCheckScheduled = true;
  window.setTimeout(() => {
    void checkScriptUpdate({ force: true, prompt: true, silent: true });
  }, delayMs);
}

export function registerScriptUpdateGlobals(): void {
  globalAny.__fatriaScriptUpdater = {
    currentVersion: SCRIPT_VERSION,
    check: checkScriptUpdate,
    showGuide: showScriptUpdateGuide,
    getState: getScriptUpdateState,
  };
}

export async function checkScriptUpdate(options: CheckScriptUpdateOptions = {}): Promise<ScriptUpdateState> {
  const cache = readUpdateCache();
  const now = Date.now();
  if (!options.force && cache.lastCheckedAt && now - cache.lastCheckedAt < UPDATE_CHECK_INTERVAL_MS) {
    applyCachedUpdateState(cache);
    const state = getScriptUpdateState();
    if (state.hasUpdate && state.manifest) {
      notifyAvailableScriptUpdate(state.manifest, cache, options);
    }
    return state;
  }

  setScriptUpdateState({
    status: 'checking',
    message: '正在检查脚本更新...',
  });

  try {
    const manifest = await fetchUpdateManifest();
    const latestVersion = normalizeVersion(manifest.version);
    const hasNewerVersion = compare(SCRIPT_VERSION, latestVersion, '<');
    const isUsingMutableReference = isCurrentScriptUsingMainReference();
    const hasUpdate = hasNewerVersion || isUsingMutableReference;

    writeUpdateCache({
      ...cache,
      lastCheckedAt: now,
      latestVersion,
      manifest,
    });

    setScriptUpdateState({
      latestVersion,
      hasUpdate,
      isUsingMutableReference,
      status: hasUpdate ? 'available' : 'latest',
      message: hasNewerVersion
        ? `上游已发布 v${latestVersion}（本分支为性转改版，不会自动更新）。`
        : isUsingMutableReference
          ? `上游已发布 v${latestVersion}（本分支为性转改版，不会自动更新）。`
          : `当前已是最新版 v${SCRIPT_VERSION}。`,
      checkedAt: now,
      manifest,
    });

    if (hasUpdate) {
      notifyAvailableScriptUpdate(manifest, cache, options);
    } else if (!options.silent && options.force) {
      notifySuccess(`当前已是最新版 v${SCRIPT_VERSION}。`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '检查更新失败';
    setScriptUpdateState({
      status: 'error',
      hasUpdate: false,
      message,
    });
    if (!options.silent) {
      notifyError(message);
    }
    console.warn('[性斗学园脚本] 检查脚本更新失败:', error);
  }

  return getScriptUpdateState();
}

export function showScriptUpdateGuide(manifestOverride?: ScriptUpdateManifest): void {
  const manifest = manifestOverride ?? scriptUpdateState.manifest;
  if (!manifest) {
    window.alert('尚未读取到更新信息。请先点击“检查更新”。');
    return;
  }

  window.alert(buildUpdateGuideText(manifest));
  writeUpdateCache({
    ...readUpdateCache(),
    dismissedVersion: normalizeVersion(manifest.version),
  });
}

/**
 * Replace this script's official jsDelivr import in the character script library
 * with the immutable release URL described by the update manifest.
 *
 * 本分支为「全员性转」改版，**禁止**自动拉取上游原版覆盖自身。
 * 此函数保留签名以兼容既有调用点，但一律拒绝执行，只回报当前检测结果。
 */
export async function applyScriptUpdate(manifestOverride?: ScriptUpdateManifest): Promise<ApplyScriptUpdateResult> {
  const manifest = manifestOverride ?? scriptUpdateState.manifest;
  if (!manifest) {
    return { updated: false, message: '尚未读取到更新信息，请先检查更新。' };
  }

  const latestVersion = normalizeVersion(manifest.version);
  return {
    updated: false,
    message:
      `本分支为性转改版，已停用自动更新，不会拉取上游原版。\n` +
      `当前运行 v${SCRIPT_VERSION}，上游最新 v${latestVersion}。\n` +
      `如需同步上游改动，请手动比对后合并（参见「性转改动对照规则.md」）。`,
  };
}

/**
 * 性转改版停用了自动更新，这里只做「告知」，不再询问是否更新。
 * 用 alert 而非 toast —— toast 会自动消失，读不完这几行说明。
 */
async function promptScriptUpdateGuide(manifest: ScriptUpdateManifest): Promise<void> {
  const latestVersion = normalizeVersion(manifest.version);
  window.alert(
    `上游已发布 v${latestVersion}，当前运行 v${SCRIPT_VERSION}。\n\n` +
      `本分支为性转改版，不会自动拉取上游原版。\n\n` +
      `如需同步，请手动比对后合并（参见「性转改动对照规则.md」）。`,
  );
}

function notifyAvailableScriptUpdate(
  manifest: ScriptUpdateManifest,
  cache: ScriptUpdateCache,
  options: CheckScriptUpdateOptions,
): void {
  const latestVersion = normalizeVersion(manifest.version);
  if (options.prompt && cache.dismissedVersion !== latestVersion) {
    void promptScriptUpdateGuide(manifest);
    return;
  }

  if (!options.silent) {
    notifyInfo(`上游已发布脚本新版本 v${latestVersion}（本分支为性转改版，不会自动更新）。`);
  }
}

async function fetchUpdateManifest(): Promise<ScriptUpdateManifest> {
  const response = await fetch(UPDATE_MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`读取更新清单失败：HTTP ${response.status}`);
  }

  const manifest = (await response.json()) as Partial<ScriptUpdateManifest>;
  return normalizeManifest(manifest);
}

function normalizeManifest(manifest: Partial<ScriptUpdateManifest>): ScriptUpdateManifest {
  const version = normalizeVersion(manifest.version);
  if (!version) {
    throw new Error('更新清单缺少 version。');
  }
  const releaseTag = normalizeReleaseTag(manifest.releaseTag);
  if (!releaseTag) {
    throw new Error('更新清单缺少 releaseTag。');
  }
  const currentRelease: ScriptUpdateRelease = {
    version,
    releaseTag,
    changelog: normalizeChangelog(manifest.changelog),
  };
  const historicalReleases = Array.isArray(manifest.releases)
    ? manifest.releases.map(normalizeRelease).filter(isPresent)
    : [];
  const releases = [
    historicalReleases.find(release => release.version === version) ?? currentRelease,
    ...historicalReleases.filter(release => release.version !== version),
  ].filter((release, index, entries) => entries.findIndex(item => item.version === release.version) === index);
  return {
    version,
    releaseTag,
    changelog: currentRelease.changelog,
    releases,
  };
}

function normalizeChangelog(value: unknown): string[] {
  return Array.isArray(value) ? value.map(safeString).filter(Boolean) : [];
}

function normalizeRelease(value: unknown): ScriptUpdateRelease | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ScriptUpdateRelease>;
  const version = normalizeVersion(candidate.version);
  if (!version) return null;
  const releaseTag = normalizeReleaseTag(candidate.releaseTag);
  return {
    version,
    releaseTag: releaseTag || undefined,
    changelog: normalizeChangelog(candidate.changelog),
  };
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

export function getScriptUpdateReleases(manifest?: ScriptUpdateManifest): ScriptUpdateRelease[] {
  if (!manifest) return [];
  if (manifest.releases && manifest.releases.length > 0) {
    return manifest.releases.map(release => ({ ...release, changelog: [...release.changelog] }));
  }
  return [
    {
      version: manifest.version,
      releaseTag: manifest.releaseTag,
      changelog: [...(manifest.changelog ?? [])],
    },
  ];
}

function applyCachedUpdateState(cache: ScriptUpdateCache): void {
  const latestVersion = normalizeVersion(cache.latestVersion || SCRIPT_VERSION) || SCRIPT_VERSION;
  const hasNewerVersion = compare(SCRIPT_VERSION, latestVersion, '<');
  const isUsingMutableReference = isCurrentScriptUsingMainReference();
  const hasUpdate = hasNewerVersion || isUsingMutableReference;
  setScriptUpdateState({
    latestVersion,
    hasUpdate,
    isUsingMutableReference,
    status: hasUpdate ? 'available' : 'latest',
    message: hasNewerVersion
      ? `发现新版本 v${latestVersion}，点击“更新至 v${latestVersion}”即可自动切换并重新加载。`
      : isUsingMutableReference
        ? `当前使用 @main 链接，点击更新按钮即可固定到 v${latestVersion}，避免缓存延迟。`
        : `当前已是最新版 v${SCRIPT_VERSION}。`,
    checkedAt: cache.lastCheckedAt,
    manifest:
      cache.manifest ??
      (hasUpdate ? { version: latestVersion, releaseTag: `v${latestVersion}`, changelog: [] } : undefined),
  });
}

function normalizeVersion(version: unknown): string {
  return safeString(version).replace(/^v/i, '');
}

function normalizeReleaseTag(value: unknown): string {
  const tag = safeString(value).replace(/^@/, '');
  return /^[A-Za-z0-9._-]+$/.test(tag) ? tag : '';
}

function isCurrentScriptUsingMainReference(): boolean {
  try {
    const script = findScriptById(getScriptTrees({ type: 'character' }), getScriptId());
    return script ? hasOfficialScriptReference(script.content, 'main') : false;
  } catch (error) {
    console.warn('[性斗学园脚本] 无法读取当前脚本链接:', error);
    return false;
  }
}

function findScriptById(trees: ScriptTree[], targetScriptId: string): Script | null {
  for (const tree of trees) {
    if (tree.type === 'script' && tree.id === targetScriptId) {
      return tree;
    }
    if (tree.type === 'folder') {
      const script = findScriptById(tree.scripts, targetScriptId);
      if (script) return script;
    }
  }
  return null;
}

interface ScriptTreeUpdateResult {
  found: boolean;
  updated: boolean;
}

function updateScriptTreeImport(
  tree: ScriptTree,
  targetScriptId: string,
  releaseTag: string,
  notify: (result: ScriptTreeUpdateResult) => void,
): ScriptTree {
  if (tree.type === 'folder') {
    return {
      ...tree,
      scripts: tree.scripts.map(script => updateScriptTreeImport(script, targetScriptId, releaseTag, notify) as Script),
    };
  }

  if (tree.id !== targetScriptId) {
    return tree;
  }

  const content = replaceOfficialScriptImport(tree.content, releaseTag);
  notify({ found: true, updated: content !== tree.content });
  return content === tree.content ? tree : { ...tree, content };
}

function replaceOfficialScriptImport(content: string, releaseTag: string): string {
  let nextContent = replaceScriptUrlPattern(content, SCRIPT_IMPORT_URL_PATTERN, releaseTag);
  nextContent = replaceScriptUrlPattern(nextContent, SCRIPT_URL_LITERAL_PATTERN, releaseTag);
  return replaceScriptUrlPattern(nextContent, SCRIPT_URL_BARE_PATTERN, releaseTag);
}

function hasOfficialScriptReference(content: string, expectedReference: string): boolean {
  for (const pattern of [SCRIPT_IMPORT_URL_PATTERN, SCRIPT_URL_LITERAL_PATTERN, SCRIPT_URL_BARE_PATTERN]) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const reference = getOfficialScriptReference(match[2]);
      if (reference === expectedReference) return true;
    }
  }
  return false;
}

function replaceScriptUrlPattern(content: string, pattern: RegExp, releaseTag: string): string {
  pattern.lastIndex = 0;
  return content.replace(pattern, (whole, prefix: string, urlText: string, suffix: string) => {
    const replacement = replaceOfficialScriptUrl(urlText, releaseTag);
    return replacement ? `${prefix}${replacement}${suffix}` : whole;
  });
}

function replaceOfficialScriptUrl(urlText: string, releaseTag: string): string | null {
  try {
    const url = new URL(urlText);
    const bundlePathIndex = getOfficialScriptBundlePathIndex(url);
    if (bundlePathIndex < 0) {
      return null;
    }

    url.pathname = `${JSDELIVR_REPOSITORY_PREFIX}${encodeURIComponent(releaseTag)}${url.pathname.slice(bundlePathIndex)}`;
    return url.href;
  } catch {
    return null;
  }
}

function getOfficialScriptReference(urlText: string): string | null {
  try {
    const url = new URL(urlText);
    const bundlePathIndex = getOfficialScriptBundlePathIndex(url);
    if (bundlePathIndex < 0) return null;
    const referencePath = url.pathname.slice(JSDELIVR_REPOSITORY_PATH.length, bundlePathIndex);
    return referencePath ? decodeURIComponent(referencePath.slice(1)) : 'main';
  } catch {
    return null;
  }
}

function getOfficialScriptBundlePathIndex(url: URL): number {
  if (
    url.protocol !== 'https:' ||
    url.hostname !== JSDELIVR_HOST ||
    !url.pathname.startsWith(JSDELIVR_REPOSITORY_PATH)
  ) {
    return -1;
  }

  const bundlePathIndex = url.pathname.indexOf('/dist/', JSDELIVR_REPOSITORY_PATH.length);
  if (bundlePathIndex < 0) return -1;

  const referencePath = url.pathname.slice(JSDELIVR_REPOSITORY_PATH.length, bundlePathIndex);
  if (referencePath !== '' && !/^@[A-Za-z0-9._-]+$/.test(referencePath)) {
    return -1;
  }

  return decodeURIComponent(url.pathname.slice(bundlePathIndex)) === SCRIPT_BUNDLE_PATH ? bundlePathIndex : -1;
}

function buildUpdateGuideText(manifest: ScriptUpdateManifest): string {
  const latestVersion = normalizeVersion(manifest.version);
  const changelog = manifest.changelog?.filter(Boolean).slice(0, 6) ?? [];
  const changelogText = changelog.length > 0 ? `\n\n更新内容：\n${changelog.map(item => `- ${item}`).join('\n')}` : '';
  return [
    `性斗学园脚本已有新版本 v${latestVersion}。`,
    '',
    `当前运行版本：v${SCRIPT_VERSION}`,
    '',
    '在设置页点击“更新至指定版本”后，脚本会自动将角色脚本库中的官方 jsDelivr 链接切换为固定发布标签，并重新加载。',
    '如果当前条目不是官方外链、是内联脚本，或发布标签尚不可用，则不会自动改写。',
    '',
    '常用处理方法：',
    '1. 优先点击设置页的“更新至指定版本”。',
    '2. 不需要清除浏览器缓存；固定发布标签会直接请求对应版本。',
    '3. 如果按钮提示当前条目不是官方外链，请手动将 import 改为带 `@vX.Y.Z` 的固定版本链接。',
    '4. 若发布标签尚不可用，请等待发布完成后再检查更新。',
    changelogText,
  ].join('\n');
}

function setScriptUpdateState(patch: Partial<ScriptUpdateState>): void {
  scriptUpdateState = {
    ...scriptUpdateState,
    ...patch,
    currentVersion: SCRIPT_VERSION,
  };
  window.dispatchEvent(new CustomEvent(SCRIPT_UPDATE_EVENT, { detail: getScriptUpdateState() }));
}

function cloneState(state: ScriptUpdateState): ScriptUpdateState {
  return {
    ...state,
    manifest: state.manifest
      ? {
          ...state.manifest,
          changelog: [...(state.manifest.changelog ?? [])],
          releases: getScriptUpdateReleases(state.manifest),
        }
      : undefined,
  };
}

function readUpdateCache(): ScriptUpdateCache {
  try {
    const raw = window.localStorage?.getItem(UPDATE_CHECK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ScriptUpdateCache;
    return {
      lastCheckedAt: Number.isFinite(Number(parsed.lastCheckedAt)) ? Number(parsed.lastCheckedAt) : undefined,
      latestVersion: normalizeVersion(parsed.latestVersion),
      dismissedVersion: normalizeVersion(parsed.dismissedVersion),
      manifest: parsed.manifest ? normalizeManifest(parsed.manifest) : undefined,
    };
  } catch {
    return {};
  }
}

function writeUpdateCache(cache: ScriptUpdateCache): void {
  try {
    window.localStorage?.setItem(UPDATE_CHECK_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // 更新缓存失败不影响脚本本体使用。
  }
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function notifyInfo(message: string): void {
  if (typeof toastr !== 'undefined') {
    toastr.info(message, '性斗学园脚本更新');
  }
}

function notifySuccess(message: string): void {
  if (typeof toastr !== 'undefined') {
    toastr.success(message, '性斗学园脚本更新');
  }
}

function notifyError(message: string): void {
  if (typeof toastr !== 'undefined') {
    toastr.error(message, '性斗学园脚本更新');
  }
}
