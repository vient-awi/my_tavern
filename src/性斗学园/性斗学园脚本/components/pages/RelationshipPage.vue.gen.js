import { createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, withModifiers as _withModifiers, normalizeClass as _normalizeClass, createTextVNode as _createTextVNode, normalizeStyle as _normalizeStyle, createStaticVNode as _createStaticVNode } from "vue"

const _hoisted_1 = { class: "relationship-page" }
const _hoisted_2 = {
  key: 0,
  class: "section"
}
const _hoisted_3 = { class: "section-header" }
const _hoisted_4 = { class: "count-badge" }
const _hoisted_5 = { class: "present-list" }
const _hoisted_6 = ["onClick"]
const _hoisted_7 = ["src", "alt", "onError"]
const _hoisted_8 = { class: "present-name" }
const _hoisted_9 = { class: "section" }
const _hoisted_10 = { class: "section-header" }
const _hoisted_11 = {
  key: 0,
  class: "count-badge"
}
const _hoisted_12 = {
  key: 0,
  class: "relationship-list"
}
const _hoisted_13 = ["onClick"]
const _hoisted_14 = { class: "rel-header" }
const _hoisted_15 = ["onClick"]
const _hoisted_16 = ["src", "alt", "onError"]
const _hoisted_17 = { class: "rel-info" }
const _hoisted_18 = { class: "rel-name" }
const _hoisted_19 = { class: "rel-tags" }
const _hoisted_20 = {
  key: 1,
  class: "rel-type type-unknown"
}
const _hoisted_21 = { class: "rel-stats" }
const _hoisted_22 = { class: "stat-item" }
const _hoisted_23 = { class: "stat-header" }
const _hoisted_24 = { class: "stat-bar" }
const _hoisted_25 = { class: "stat-item" }
const _hoisted_26 = { class: "stat-header" }
const _hoisted_27 = { class: "dominance-bar" }
const _hoisted_28 = {
  key: 0,
  class: "stat-item"
}
const _hoisted_29 = { class: "stat-header" }
const _hoisted_30 = { class: "stat-value training" }
const _hoisted_31 = { class: "stat-bar" }
const _hoisted_32 = {
  key: 1,
  class: "stat-item"
}
const _hoisted_33 = { class: "stat-header" }
const _hoisted_34 = { class: "stat-bar" }
const _hoisted_35 = { class: "section" }
const _hoisted_36 = {
  key: 0,
  class: "reputation-list"
}
const _hoisted_37 = { class: "rep-header" }
const _hoisted_38 = { class: "rep-icon" }
const _hoisted_39 = { class: "rep-info" }
const _hoisted_40 = { class: "rep-name" }
const _hoisted_41 = { class: "rep-bar" }
const _hoisted_42 = { class: "modal-header" }
const _hoisted_43 = { class: "modal-body avatar-carousel" }
const _hoisted_44 = ["src", "alt"]
const _hoisted_45 = {
  key: 2,
  class: "avatar-locked-panel"
}
const _hoisted_46 = {
  key: 0,
  class: "avatar-carousel-footer"
}
const _hoisted_47 = {
  key: 0,
  class: "fas fa-lock"
}
const _hoisted_48 = {
  class: "avatar-slide-dots",
  "aria-hidden": "true"
}

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _createElementVNode("div", _hoisted_1, [
      _createCommentVNode(" 在场人物 "),
      (_ctx.presentCharacters.length > 0)
        ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
            _createElementVNode("div", _hoisted_3, [
              _cache[9] || (_cache[9] = _createElementVNode("i", { class: "fas fa-users" }, null, -1 /* CACHED */)),
              _cache[10] || (_cache[10] = _createElementVNode("span", null, "在场人物", -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_4, _toDisplayString(_ctx.presentCharacters.length), 1 /* TEXT */)
            ]),
            _createElementVNode("div", _hoisted_5, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.presentCharacters, (name, index) => {
                return (_openBlock(), _createElementBlock("div", {
                  class: "present-item",
                  key: index
                }, [
                  _createElementVNode("div", {
                    class: "present-avatar",
                    onClick: $event => (_ctx.showAvatarModal(name))
                  }, [
                    _createElementVNode("img", {
                      src: _ctx.getAvatarUrl(name),
                      alt: name,
                      onLoad: _cache[0] || (_cache[0] = $event => (_ctx.handleImageLoad($event))),
                      onError: $event => (_ctx.handleImageError($event, name)),
                      class: "avatar-img"
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_7)
                  ], 8 /* PROPS */, _hoisted_6),
                  _createElementVNode("span", _hoisted_8, _toDisplayString(name), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ]))
        : _createCommentVNode("v-if", true),
      _createCommentVNode(" 关系网络 "),
      _createElementVNode("div", _hoisted_9, [
        _createElementVNode("div", _hoisted_10, [
          _cache[11] || (_cache[11] = _createElementVNode("i", { class: "fas fa-heart" }, null, -1 /* CACHED */)),
          _cache[12] || (_cache[12] = _createElementVNode("span", null, "关系网络", -1 /* CACHED */)),
          (Object.keys(_ctx.relationships).length > 0)
            ? (_openBlock(), _createElementBlock("span", _hoisted_11, _toDisplayString(Object.keys(_ctx.relationships).length), 1 /* TEXT */))
            : _createCommentVNode("v-if", true)
        ]),
        (Object.keys(_ctx.relationships).length > 0)
          ? (_openBlock(), _createElementBlock("div", _hoisted_12, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.relationships, (rel, name) => {
                return (_openBlock(), _createElementBlock("div", {
                  class: "relationship-card",
                  key: name
                }, [
                  _createElementVNode("button", {
                    class: "discard-btn",
                    onClick: _withModifiers($event => (_ctx.forgetRelationship(String(name))), ["stop"]),
                    title: "遗忘"
                  }, [...(_cache[13] || (_cache[13] = [
                    _createElementVNode("i", { class: "fas fa-times" }, null, -1 /* CACHED */)
                  ]))], 8 /* PROPS */, _hoisted_13),
                  _createElementVNode("div", _hoisted_14, [
                    _createElementVNode("div", {
                      class: "rel-avatar",
                      onClick: $event => (_ctx.showAvatarModal(String(name)))
                    }, [
                      _createElementVNode("img", {
                        src: _ctx.getAvatarUrl(String(name)),
                        alt: String(name),
                        onLoad: _cache[1] || (_cache[1] = $event => (_ctx.handleImageLoad($event))),
                        onError: $event => (_ctx.handleImageError($event, String(name))),
                        class: "avatar-img"
                      }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_16)
                    ], 8 /* PROPS */, _hoisted_15),
                    _createElementVNode("div", _hoisted_17, [
                      _createElementVNode("div", _hoisted_18, _toDisplayString(name), 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_19, [
                        (rel.关系类型)
                          ? (_openBlock(), _createElementBlock("div", {
                              key: 0,
                              class: _normalizeClass(["rel-type", _ctx.getRelationTypeClass(rel.关系类型)])
                            }, [
                              _createElementVNode("i", {
                                class: _normalizeClass(_ctx.getRelationIcon(rel.关系类型))
                              }, null, 2 /* CLASS */),
                              _createTextVNode(" " + _toDisplayString(rel.关系类型), 1 /* TEXT */)
                            ], 2 /* CLASS */))
                          : (_openBlock(), _createElementBlock("div", _hoisted_20, [...(_cache[14] || (_cache[14] = [
                              _createElementVNode("i", { class: "fas fa-user-circle" }, null, -1 /* CACHED */),
                              _createTextVNode(" 未建立关系 ", -1 /* CACHED */)
                            ]))])),
                        _createElementVNode("div", {
                          class: _normalizeClass(["rel-oath", _ctx.getOathClass(rel.誓约)])
                        }, [
                          _createElementVNode("i", {
                            class: _normalizeClass(_ctx.getOathIcon(rel.誓约))
                          }, null, 2 /* CLASS */),
                          _createTextVNode(" " + _toDisplayString(_ctx.getOathLabel(rel.誓约)), 1 /* TEXT */)
                        ], 2 /* CLASS */)
                      ])
                    ])
                  ]),
                  _createCommentVNode(" 关系数值 "),
                  _createElementVNode("div", _hoisted_21, [
                    _createElementVNode("div", _hoisted_22, [
                      _createElementVNode("div", _hoisted_23, [
                        _cache[15] || (_cache[15] = _createElementVNode("span", { class: "stat-label" }, "好感度", -1 /* CACHED */)),
                        _createElementVNode("span", {
                          class: _normalizeClass(["stat-value", _ctx.getAffectionClass(rel.好感度)])
                        }, _toDisplayString(rel.好感度 || 0), 3 /* TEXT, CLASS */)
                      ]),
                      _createElementVNode("div", _hoisted_24, [
                        _createElementVNode("div", {
                          class: _normalizeClass(["stat-fill affection", _ctx.getAffectionClass(rel.好感度)]),
                          style: _normalizeStyle({ width: `${rel.好感度 || 0}%` })
                        }, null, 6 /* CLASS, STYLE */)
                      ])
                    ]),
                    _createElementVNode("div", _hoisted_25, [
                      _createElementVNode("div", _hoisted_26, [
                        _cache[16] || (_cache[16] = _createElementVNode("span", { class: "stat-label" }, "支配度", -1 /* CACHED */)),
                        _createElementVNode("span", {
                          class: _normalizeClass(["stat-value dominance-value", _ctx.getDominanceClass(rel.支配度)])
                        }, _toDisplayString(_ctx.formatDominance(rel.支配度)) + " " + _toDisplayString(_ctx.getDominanceLabel(rel.支配度)), 3 /* TEXT, CLASS */)
                      ]),
                      _createElementVNode("div", _hoisted_27, [
                        _cache[17] || (_cache[17] = _createElementVNode("div", { class: "dominance-midline" }, null, -1 /* CACHED */)),
                        _createElementVNode("div", {
                          class: _normalizeClass(["dominance-fill", _ctx.getDominanceClass(rel.支配度)]),
                          style: _normalizeStyle(_ctx.getDominanceStyle(rel.支配度))
                        }, null, 6 /* CLASS, STYLE */)
                      ])
                    ]),
                    (rel.调教进度 !== undefined)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_28, [
                          _createElementVNode("div", _hoisted_29, [
                            _cache[18] || (_cache[18] = _createElementVNode("span", { class: "stat-label" }, "调教进度", -1 /* CACHED */)),
                            _createElementVNode("span", _hoisted_30, _toDisplayString(rel.调教进度 || 0) + "%", 1 /* TEXT */)
                          ]),
                          _createElementVNode("div", _hoisted_31, [
                            _createElementVNode("div", {
                              class: "stat-fill training",
                              style: _normalizeStyle({ width: `${rel.调教进度 || 0}%` })
                            }, null, 4 /* STYLE */)
                          ])
                        ]))
                      : _createCommentVNode("v-if", true),
                    (rel.臣服度 !== undefined)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_32, [
                          _createElementVNode("div", _hoisted_33, [
                            _cache[19] || (_cache[19] = _createElementVNode("span", { class: "stat-label" }, "臣服度", -1 /* CACHED */)),
                            _createElementVNode("span", {
                              class: _normalizeClass(["stat-value", _ctx.getSubmissionClass(rel.臣服度)])
                            }, _toDisplayString(rel.臣服度 || 0), 3 /* TEXT, CLASS */)
                          ]),
                          _createElementVNode("div", _hoisted_34, [
                            _createElementVNode("div", {
                              class: _normalizeClass(["stat-fill submission", _ctx.getSubmissionClass(rel.臣服度)]),
                              style: _normalizeStyle({ width: `${rel.臣服度 || 0}%` })
                            }, null, 6 /* CLASS, STYLE */)
                          ])
                        ]))
                      : _createCommentVNode("v-if", true)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]))
          : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
              _createCommentVNode(" 空状态 "),
              _cache[20] || (_cache[20] = _createStaticVNode("<div class=\"empty-state\" data-v-b36a96c6><div class=\"empty-icon\" data-v-b36a96c6><i class=\"fas fa-heart-crack\" data-v-b36a96c6></i></div><p class=\"empty-title\" data-v-b36a96c6>暂无关系数据</p><p class=\"empty-desc\" data-v-b36a96c6>与学园中的人物互动来建立关系</p></div>", 1))
            ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
      ]),
      _createCommentVNode(" 势力声望 "),
      _createElementVNode("div", _hoisted_35, [
        _cache[22] || (_cache[22] = _createElementVNode("div", { class: "section-header" }, [
          _createElementVNode("i", { class: "fas fa-flag" }),
          _createElementVNode("span", null, "势力声望")
        ], -1 /* CACHED */)),
        (Object.keys(_ctx.reputations).length > 0)
          ? (_openBlock(), _createElementBlock("div", _hoisted_36, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.reputations, (value, name) => {
                return (_openBlock(), _createElementBlock("div", {
                  class: "reputation-card",
                  key: name
                }, [
                  _createElementVNode("div", _hoisted_37, [
                    _createElementVNode("div", _hoisted_38, [
                      _createElementVNode("i", {
                        class: _normalizeClass(_ctx.getReputationIcon(String(name)))
                      }, null, 2 /* CLASS */)
                    ]),
                    _createElementVNode("div", _hoisted_39, [
                      _createElementVNode("div", _hoisted_40, _toDisplayString(name), 1 /* TEXT */),
                      _createElementVNode("div", {
                        class: _normalizeClass(["rep-value", _ctx.getReputationClass(Number(value))])
                      }, _toDisplayString(Number(value) > 0 ? '+' : '') + _toDisplayString(Number(value)), 3 /* TEXT, CLASS */)
                    ])
                  ]),
                  _createElementVNode("div", _hoisted_41, [
                    _createElementVNode("div", {
                      class: _normalizeClass(["rep-fill", _ctx.getReputationClass(Number(value))]),
                      style: _normalizeStyle({ width: `${_ctx.getReputationPercentage(Number(value))}%` })
                    }, null, 6 /* CLASS, STYLE */)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]))
          : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
              _createCommentVNode(" 空状态 "),
              _cache[21] || (_cache[21] = _createStaticVNode("<div class=\"empty-state\" data-v-b36a96c6><div class=\"empty-icon\" data-v-b36a96c6><i class=\"fas fa-flag\" data-v-b36a96c6></i></div><p class=\"empty-title\" data-v-b36a96c6>暂无声望数据</p><p class=\"empty-desc\" data-v-b36a96c6>与各势力互动来建立声望</p></div>", 1))
            ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
      ])
    ]),
    _createCommentVNode(" 头像放大模态框 "),
    (_ctx.showModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 0,
          class: "avatar-modal",
          onClick: _cache[8] || (_cache[8] = (...args) => (_ctx.closeModal && _ctx.closeModal(...args)))
        }, [
          _cache[27] || (_cache[27] = _createElementVNode("div", { class: "modal-backdrop" }, null, -1 /* CACHED */)),
          _createElementVNode("div", {
            class: "modal-content",
            onClick: _cache[7] || (_cache[7] = _withModifiers(() => {}, ["stop"]))
          }, [
            _createElementVNode("button", {
              class: "modal-close",
              onClick: _cache[2] || (_cache[2] = (...args) => (_ctx.closeModal && _ctx.closeModal(...args)))
            }, [...(_cache[23] || (_cache[23] = [
              _createElementVNode("i", { class: "fas fa-times" }, null, -1 /* CACHED */)
            ]))]),
            _createElementVNode("div", _hoisted_42, [
              _createElementVNode("h3", null, _toDisplayString(_ctx.modalCharacterName), 1 /* TEXT */)
            ]),
            _createElementVNode("div", _hoisted_43, [
              (_ctx.modalAvatarSlides.length > 1)
                ? (_openBlock(), _createElementBlock("button", {
                    key: 0,
                    class: "avatar-nav avatar-nav-prev",
                    type: "button",
                    title: "上一个头像",
                    "aria-label": "上一个头像",
                    onClick: _cache[3] || (_cache[3] = (...args) => (_ctx.showPreviousAvatarVariation && _ctx.showPreviousAvatarVariation(...args)))
                  }, [...(_cache[24] || (_cache[24] = [
                    _createElementVNode("i", { class: "fas fa-chevron-left" }, null, -1 /* CACHED */)
                  ]))]))
                : _createCommentVNode("v-if", true),
              (_ctx.currentModalAvatarSlide.unlocked)
                ? (_openBlock(), _createElementBlock("img", {
                    key: `${_ctx.currentModalAvatarSlide.kind}:${_ctx.currentModalAvatarSlide.variationKey || _ctx.currentModalAvatarSlide.url}`,
                    src: _ctx.currentModalAvatarSlide.url,
                    alt: _ctx.modalCharacterName,
                    onLoad: _cache[4] || (_cache[4] = $event => (_ctx.handleModalImageLoad($event))),
                    onError: _cache[5] || (_cache[5] = (...args) => (_ctx.handleModalImageError && _ctx.handleModalImageError(...args))),
                    class: "modal-avatar-img"
                  }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_44))
                : (_openBlock(), _createElementBlock("div", _hoisted_45, [
                    _cache[25] || (_cache[25] = _createElementVNode("i", { class: "fas fa-lock" }, null, -1 /* CACHED */)),
                    _createElementVNode("span", null, _toDisplayString(_ctx.currentModalAvatarSlide.label), 1 /* TEXT */)
                  ])),
              (_ctx.modalAvatarSlides.length > 1)
                ? (_openBlock(), _createElementBlock("button", {
                    key: 3,
                    class: "avatar-nav avatar-nav-next",
                    type: "button",
                    title: "下一个头像",
                    "aria-label": "下一个头像",
                    onClick: _cache[6] || (_cache[6] = (...args) => (_ctx.showNextAvatarVariation && _ctx.showNextAvatarVariation(...args)))
                  }, [...(_cache[26] || (_cache[26] = [
                    _createElementVNode("i", { class: "fas fa-chevron-right" }, null, -1 /* CACHED */)
                  ]))]))
                : _createCommentVNode("v-if", true)
            ]),
            (_ctx.modalAvatarSlides.length > 1)
              ? (_openBlock(), _createElementBlock("div", _hoisted_46, [
                  _createElementVNode("span", {
                    class: _normalizeClass(["avatar-slide-label", { locked: !_ctx.currentModalAvatarSlide.unlocked }])
                  }, [
                    (!_ctx.currentModalAvatarSlide.unlocked)
                      ? (_openBlock(), _createElementBlock("i", _hoisted_47))
                      : _createCommentVNode("v-if", true),
                    _createTextVNode(" " + _toDisplayString(_ctx.currentModalAvatarSlide.label), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("div", _hoisted_48, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.modalAvatarSlides, (slide, index) => {
                      return (_openBlock(), _createElementBlock("span", {
                        key: `${slide.label}-${index}`,
                        class: _normalizeClass({ active: index === _ctx.modalAvatarIndex, locked: !slide.unlocked })
                      }, null, 2 /* CLASS */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true)
          ])
        ]))
      : _createCommentVNode("v-if", true)
  ], 64 /* STABLE_FRAGMENT */))
}