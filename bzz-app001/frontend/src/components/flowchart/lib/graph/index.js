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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var react_1 = __importStar(require("react"));
var xflow_1 = require("@antv/xflow");
var toolbar_1 = require("../components/toolbar");
var menu_1 = require("../components/menu");
var util_1 = require("../util");
var service_1 = require("./service");
var context_1 = __importDefault(require("../context"));
var appendUtils_1 = require("./appendUtils");
var constants_1 = require("./constants");
var Flowchart = function (props) {
    var _a = props, className = _a.className, style = _a.style, detailPanelProps = _a.detailPanelProps, toolbarPanelProps = _a.toolbarPanelProps, _b = _a.nodePanelProps, nodePanelProps = _b === void 0 ? {} : _b, _c = _a.scaleToolbarPanelProps, scaleToolbarPanelProps = _c === void 0 ? {} : _c, _d = _a.contextMenuPanelProps, contextMenuPanelProps = _d === void 0 ? {} : _d, _e = _a.canvasProps, canvasProps = _e === void 0 ? {} : _e, keyBindingProps = _a.keyBindingProps, 
    // miniMapProps = {},
    onAddNode = _a.onAddNode, onAddEdge = _a.onAddEdge, onConfigChange = _a.onConfigChange, onDestroy = _a.onDestroy, onConfigReady = _a.onConfigReady, isAutoCenter = _a.isAutoCenter, data = _a.data, mode = _a.mode, onReady = _a.onReady;
    var uuidv4Ref = (0, react_1.useRef)((0, xflow_1.uuidv4)());
    var container = (0, react_1.useRef)();
    (0, util_1.setProps)(props, uuidv4Ref.current, container);
    var _f = canvasProps.position, position = _f === void 0 ? { top: 40, left: 240, right: 240, bottom: 0 } : _f;
    // const { position: miniMapPosition = { bottom: 12, right: 12 }, show: showMinimMap = true } = miniMapProps;
    var graphRef = (0, react_1.useRef)();
    var menuConfig = (0, menu_1.useMenuConfig)(contextMenuPanelProps);
    var commandConfig = (0, service_1.useCmdConfig)({
        flowchartId: uuidv4Ref.current,
    }); // ?????? getProps
    var keybindingConfig = keyBindingProps || (0, service_1.useKeybindingConfig)();
    var _g = scaleToolbarPanelProps.show, show = _g === void 0 ? true : _g;
    var _h = contextMenuPanelProps.show, showMenu = _h === void 0 ? true : _h;
    var loadData = (0, react_1.useCallback)(function (app) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (data) {
                (0, util_1.excLoadData)(app, data);
            }
            return [2 /*return*/];
        });
    }); }, [data]);
    (0, react_1.useEffect)(function () {
        return function () {
            var _a;
            (_a = graphRef.current) === null || _a === void 0 ? void 0 : _a.dispose();
        };
    }, []);
    return (react_1.default.createElement(context_1.default.Provider, { value: { flowchartId: uuidv4Ref.current } },
        react_1.default.createElement("div", { className: "xflow-canvas-container", "data-flowchart-id": uuidv4Ref.current, ref: container, style: { width: '100%', height: '100%', backgroundColor: '#fff' } },
            react_1.default.createElement(xflow_1.XFlow, { className: className, style: style, commandConfig: commandConfig, onAppDestroy: onDestroy, isAutoCenter: isAutoCenter, onAppConfigReady: onConfigReady, onLoad: function (app) { return __awaiter(void 0, void 0, void 0, function () {
                    var X6Graph;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, app.getGraphInstance()];
                            case 1:
                                X6Graph = (_a.sent());
                                (0, util_1.setInstance)(X6Graph, app, uuidv4Ref.current);
                                X6Graph.flowchartId = uuidv4Ref.current;
                                graphRef.current = X6Graph;
                                loadData(app);
                                onReady === null || onReady === void 0 ? void 0 : onReady((0, appendUtils_1.appendUtils)(X6Graph, app), app);
                                return [2 /*return*/];
                        }
                    });
                }); } },
                react_1.default.createElement(xflow_1.FlowchartExtension, null),
                react_1.default.createElement(toolbar_1.ToolbarPanel, __assign({}, toolbarPanelProps, { flowchartId: uuidv4Ref.current })),
                react_1.default.createElement(xflow_1.FlowchartNodePanel, __assign({}, nodePanelProps)),
                react_1.default.createElement(xflow_1.FlowchartCanvas, { config: __assign(__assign({}, canvasProps), { onAddNode: onAddNode, onAddEdge: onAddEdge, onConfigChange: onConfigChange }), mode: mode, position: position },
                    show && react_1.default.createElement(xflow_1.CanvasScaleToolbar, __assign({}, Object.assign({}, constants_1.DEFAULT_SCALE_TOOLBAR_PROPS, scaleToolbarPanelProps))),
                    showMenu && react_1.default.createElement(xflow_1.CanvasContextMenu, { config: menuConfig })),
                react_1.default.createElement(xflow_1.FlowchartFormPanel, __assign({}, detailPanelProps)),
                keyBindingProps !== false && react_1.default.createElement(xflow_1.KeyBindings, { config: keybindingConfig })))));
};
exports.default = Flowchart;
