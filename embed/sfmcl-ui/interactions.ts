// Keep the synced launcher source untouched. The showcase retains navigation
// and visual controls, while action buttons only acknowledge a successful click.
const controls = 'button, a[href], [role="button"], .pixel-select-option';
const visualControls = [
  '#sidebar-navigation button',
  '.sidebar-collapse',
  '.sidebar-task',
  '.profile-button',
  '.topbar button',
  '[role="tab"]',
  '[role="combobox"]',
  '[role="switch"]',
  '.pixel-select-option',
  '.pixel-search-clear',
  '.theme-option',
  '.players-view-switch',
  '.catalog-view',
  '.catalog-filter-toggle',
  '.job-toggle',
  '.launch-switch',
  '.launch-version-option',
  '.sidebar-favorite',
  '.home-summary-action',
  '.home-announcement-toggle',
  '.notice-toggle',
  '.notification-deck button',
].join(', ');
const visualLabels = /^(?:选择角色 |选择 |切换模型|切换预览朝向|游戏设置 |查看 .+ 本地资源|显示 |仅显示收藏版本$|移除.+筛选$|移除分类筛选$|清空|上一页$|下一页$|返回|关闭$|编辑布局$|完成编辑$|重置筛选$|清除筛选$|筛选$|收起筛选$)/;
const deepLabels = /^(?:查看 .+ (?:详情|日志)$|查看 Minecraft .+ 安装配置$|查看文件|查看日志$|更多$|管理 )/;

type Interaction = 'visual' | 'success' | 'deep';
function labelOf(control: Element) {
  return (control.getAttribute('aria-label') || control.textContent || '')
    .replace(/\s+/g, ' ').trim();
}
function interactionOf(control: Element): Interaction {
  const label = labelOf(control);
  if (deepLabels.test(label) || control.matches('.catalog-project-info'))
    return 'deep';
  if (control.matches(visualControls) || visualLabels.test(label))
    return 'visual';
  return 'success';
}

export function initializePreviewInteractions(notify: (message: string) => void) {
  const acknowledge = (control: Element) => {
    const label = labelOf(control);
    notify(label ? `${label}成功` : '操作成功');
    // Action menus close normally, even though their desktop handlers are skipped.
    if (control.closest('.context-menu, .pixel-select-popup'))
      control.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', bubbles: true,
      }));
  };
  const click = (event: MouseEvent) => {
    const control = event.target instanceof Element
      ? event.target.closest(controls) : null;
    if (!control) return;
    const interaction = interactionOf(control);
    if (interaction === 'visual') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (interaction === 'success') acknowledge(control);
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    notify('操作成功');
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.altKey && /^Arrow/.test(event.key) && event.target instanceof Element &&
      event.target.closest('.players-select, .home-widget-row')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      notify('调整顺序成功');
      return;
    }
    if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement))
      return;
    const form = event.target.closest('form');
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const button = form.querySelector('button[type="submit"]');
    if (button) acknowledge(button);
    else notify('操作成功');
  };
  const pointerdown = (event: PointerEvent) => {
    if (event.target instanceof Element &&
      event.target.closest('.players-select, .home-widget-row'))
      event.stopImmediatePropagation();
  };
  const adapt = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>(controls).forEach((control) => {
      const interaction = interactionOf(control);
      if (interaction === 'deep') {
        if (control.getAttribute('aria-disabled') !== 'true')
          control.setAttribute('aria-disabled', 'true');
        if (control.tabIndex !== -1) control.tabIndex = -1;
        control.dataset.previewInert = 'true';
      } else if (interaction === 'success') {
        // Empty forms and missing desktop prerequisites must still succeed.
        if (control instanceof HTMLButtonElement && control.disabled)
          control.disabled = false;
        if (control.getAttribute('aria-disabled') === 'true')
          control.removeAttribute('aria-disabled');
      }
    });
  };
  // Include React portals for dropdowns and menus, as well as the app surface.
  const observer = new MutationObserver(() => adapt(document));
  observer.observe(document.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['disabled', 'aria-label', 'aria-disabled'],
  });
  adapt(document);
  document.addEventListener('click', click, true);
  document.addEventListener('submit', submit, true);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('pointerdown', pointerdown, true);
  return () => {
    observer.disconnect();
    document.removeEventListener('click', click, true);
    document.removeEventListener('submit', submit, true);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('pointerdown', pointerdown, true);
  };
}
