"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMenuConfig = exports.NsMenuItemConfig = void 0;
var xflow_1 = require("@antv/xflow");
var xflow_2 = require("@antv/xflow");
var icons_1 = require("@ant-design/icons");
/** menuitem ?????? */
var NsMenuItemConfig;
(function (NsMenuItemConfig) {
    var _this = this;
    /** ?????????????????????icon */
    xflow_2.IconStore.set('DeleteOutlined', icons_1.DeleteOutlined);
    xflow_2.IconStore.set('EditOutlined', icons_1.EditOutlined);
    xflow_2.IconStore.set('StopOutlined', icons_1.StopOutlined);
    NsMenuItemConfig.DELETE_EDGE = {
        id: xflow_2.XFlowEdgeCommands.DEL_EDGE.id,
        label: '?????????',
        iconName: 'DeleteOutlined',
        onClick: function (_a) {
            var target = _a.target, commandService = _a.commandService;
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    if (target.data) {
                        commandService.executeCommand(xflow_2.XFlowEdgeCommands.DEL_EDGE.id, {
                            edgeConfig: target.data,
                        });
                    }
                    return [2 /*return*/];
                });
            });
        },
    };
    NsMenuItemConfig.DELETE_NODE = {
        id: xflow_2.XFlowNodeCommands.DEL_NODE.id,
        label: '????????????',
        iconName: 'DeleteOutlined',
        onClick: function (_a) {
            var target = _a.target, commandService = _a.commandService;
            return __awaiter(_this, void 0, void 0, function () {
                var _b, _c;
                return __generator(this, function (_d) {
                    if (target.data && ((_b = target === null || target === void 0 ? void 0 : target.data) === null || _b === void 0 ? void 0 : _b.id)) {
                        commandService.executeCommand(xflow_2.XFlowNodeCommands.DEL_NODE.id, {
                            nodeConfig: { id: (_c = target === null || target === void 0 ? void 0 : target.data) === null || _c === void 0 ? void 0 : _c.id },
                        });
                    }
                    return [2 /*return*/];
                });
            });
        },
    };
    NsMenuItemConfig.EMPTY_MENU = {
        id: 'EMPTY_MENU_ITEM',
        label: '????????????',
        isEnabled: false,
        iconName: 'DeleteOutlined',
    };
    NsMenuItemConfig.SEPARATOR = {
        id: 'separator',
        type: xflow_1.MenuItemType.Separator,
    };
})(NsMenuItemConfig = exports.NsMenuItemConfig || (exports.NsMenuItemConfig = {}));
exports.useMenuConfig = (0, xflow_1.createCtxMenuConfig)(function (config, proxy) {
    var _a = proxy.getValue(), _b = _a.showOfficial, showOfficial = _b === void 0 ? true : _b, submenu = _a.submenu;
    config.setMenuModelService(function (target, model) { return __awaiter(void 0, void 0, void 0, function () {
        var type;
        return __generator(this, function (_a) {
            if (!target) {
                return [2 /*return*/];
            }
            type = target.type;
            switch (type) {
                /** ???????????? */
                case 'node' /*  */:
                    model.setValue({
                        id: 'root',
                        type: xflow_1.MenuItemType.Root,
                        submenu: (showOfficial ? [NsMenuItemConfig.DELETE_NODE] : []).concat(submenu ? submenu(__assign(__assign({}, config), { menuType: 'node' })) : []),
                    });
                    break;
                /** ????????? */
                case 'edge':
                    model.setValue({
                        id: 'root',
                        type: xflow_1.MenuItemType.Root,
                        submenu: (showOfficial ? [NsMenuItemConfig.DELETE_EDGE] : []).concat(submenu ? submenu(__assign(__assign({}, config), { menuType: 'edge' })) : []),
                    });
                    break;
                /** ???????????? */
                case 'blank':
                    model.setValue({
                        id: 'root',
                        type: xflow_1.MenuItemType.Root,
                        submenu: (showOfficial ? [NsMenuItemConfig.EMPTY_MENU] : []).concat(submenu ? submenu(__assign(__assign({}, config), { menuType: 'blank' })) : []),
                    });
                    break;
                /** ???????????? */
                default:
                    model.setValue({
                        id: 'root',
                        type: xflow_1.MenuItemType.Root,
                        submenu: (showOfficial ? [NsMenuItemConfig.EMPTY_MENU] : []).concat(submenu ? submenu(__assign(__assign({}, config), { menuType: 'blank' })) : []),
                    });
                    break;
            }
            return [2 /*return*/];
        });
    }); });
});
