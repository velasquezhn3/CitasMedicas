"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionManager = void 0;
const connection_manager_singleton_impl_1 = require("./connection-manager-singleton-impl");
exports.connectionManager = new connection_manager_singleton_impl_1.ConnectionManager();
