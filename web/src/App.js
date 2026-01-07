import React, { Suspense } from 'react';
import { Outlet, Route, Routes } from "react-router-dom";

import './App.css';
import './Arco.css';
import ManagerLayout from "./layout/ManagerLayout";
import UserLayout from "./layout/UserLayout";

import Landing from "./components/Landing";
import NoMatch from "./components/NoMatch";
import NoPermission from "./components/NoPermission";
import Redirect from "./components/Redirect";
import AlarmLog from './components/log-audit/AlarmLog';

const GuacdMonitor = React.lazy(() => import("./components/session/GuacdMonitor"));
const GuacdPlayback = React.lazy(() => import("./components/session/GuacdPlayback"));
const TermMonitor = React.lazy(() => import("./components/session/TermMonitor"));
const TermPlayback = React.lazy(() => import("./components/session/TermPlayback"));

const BatchCommand = React.lazy(() => import("./components/devops/BatchCommand"));
const LoginPolicyDetail = React.lazy(() => import("./components/security/LoginPolicyDetail"));
const Login = React.lazy(() => import("./components/Login"));
const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard"));
const Monitoring = React.lazy(() => import("./components/dashboard/Monitoring"));

const Asset = React.lazy(() => import("./components/asset/Asset"));
const AssetDetail = React.lazy(() => import("./components/asset/AssetDetail"));
const MyFile = React.lazy(() => import("./components/worker/MyFile"));
const AccessGateway = React.lazy(() => import("./components/asset/AccessGateway"));
const MyAsset = React.lazy(() => import("./components/worker/MyAsset"));
const MyCommand = React.lazy(() => import("./components/worker/MyCommand"));
const MyInfo = React.lazy(() => import("./components/worker/MyInfo"));
const MyImport = React.lazy(() => import("./components/worker/import/Apply"));
const MyExport = React.lazy(() => import("./components/worker/export/Apply"));


const Guacd = React.lazy(() => import("./components/access/Guacd"));
const Term = React.lazy(() => import("./components/access/Term"));

const User = React.lazy(() => import("./components/user/user/User"));
const UserDetailPage = React.lazy(() => import("./components/user/user/UserDetailPage"));
const Role = React.lazy(() => import("./components/user/Role"));
const RoleDetail = React.lazy(() => import("./components/user/RoleDetail"));
const UserGroup = React.lazy(() => import("./components/user/UserGroup"));
const UserGroupDetail = React.lazy(() => import("./components/user/UserGroupDetail"));

const Strategy = React.lazy(() => import("./components/authorised/Strategy"));
const StrategyDetail = React.lazy(() => import("./components/authorised/StrategyDetail"));
const Info = React.lazy(() => import("./components/Info"));

const OnlineSession = React.lazy(() => import("./components/session/OnlineSession"));
const OfflineSession = React.lazy(() => import("./components/session/OfflineSession"));
const Command = React.lazy(() => import("./components/asset/Command"));
const ExecuteCommand = React.lazy(() => import("./components/devops/ExecuteCommand"));
const Credential = React.lazy(() => import("./components/asset/Credential"));

const Job = React.lazy(() => import("./components/devops/Job"));
const LoginLog = React.lazy(() => import("./components/log-audit/LoginLog"));
const Security = React.lazy(() => import("./components/security/Security"));
const Storage = React.lazy(() => import("./components/devops/Storage"));

const Setting = React.lazy(() => import("./components/setting/Setting"));
const LoginPolicy = React.lazy(() => import("./components/security/LoginPolicy"));

const Todo = React.lazy(() => import("./components/todo/Task"));
const Done = React.lazy(() => import("./components/done/Task"));

const Send = React.lazy(() => import("./components/send/Apply"));
const ApplyAudit = React.lazy(() => import("./components/apply-audit/Task"));


const Import = React.lazy(() => import("./components/import/Apply"));
const Export = React.lazy(() => import("./components/export/Apply"));


const TaskProcess = React.lazy(() => import("./components/task-process/TaskProcess"));

const OperLog = React.lazy(() => import("./components/log-audit/OperLog"));
const StorageLog = React.lazy(() => import("./components/log-audit/StorageLog"));

const SensitiveRule = React.lazy(() => import("./components/sensitive-rule/SensitiveRule"));
const SensitiveRuleGroup = React.lazy(() => import("./components/sensitive-rule-group/SensitiveRuleGroup"));
const SensitiveRuleGroupDetail = React.lazy(() => import("./components/sensitive-rule-group/SensitiveRuleGroupDetail"));

const Apply = React.lazy(() => import("./components/apply/Apply"));
const Audit = React.lazy(() => import("./components/audit/Audit"));
const Task = React.lazy(() => import("./components/task/Task"));

const Device = React.lazy(() => import("./components/device/Device"));
const DictType = React.lazy(() => import("./components/dict/DictType"));
const HeartLog = React.lazy(() => import("./components/log-audit/HeartLog"));

const SensitiveLog = React.lazy(() => import("./components/log-audit/SensitiveLog"));
const App = () => {

    return (
        <Routes>

            <Route path="/" element={<Redirect/>}/>

            <Route element={
                <Suspense fallback={<Landing/>}>
                    <Outlet/>
                </Suspense>
            }>
                <Route path="/access" element={<Guacd/>}/>
                <Route path="/term" element={<Term/>}/>
                <Route path="/term-monitor" element={<TermMonitor/>}/>
                <Route path="/term-playback" element={<TermPlayback/>}/>
                <Route path="/guacd-monitor" element={<GuacdMonitor/>}/>
                <Route path="/guacd-playback" element={<GuacdPlayback/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/permission-denied" element={<NoPermission/>}/>
                <Route path="*" element={<NoMatch/>}/>
            </Route>

            <Route element={<ManagerLayout/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/monitoring" element={<Monitoring/>}/>

                <Route path="/user" element={<User/>}/>
                <Route path="/user/:userId" element={<UserDetailPage/>}/>
                <Route path="/role" element={<Role/>}/>
                <Route path="/role/:roleId" element={<RoleDetail/>}/>
                <Route path="/user-group" element={<UserGroup/>}/>
                <Route path="/user-group/:userGroupId" element={<UserGroupDetail/>}/>

                <Route path="/asset" element={<Asset/>}/>
                <Route path="/asset/:assetId" element={<AssetDetail/>}/>
                <Route path="/credential" element={<Credential/>}/>
                <Route path="/command" element={<Command/>}/>
                <Route path="/batch-command" element={<BatchCommand/>}/>
                <Route path="/execute-command" element={<ExecuteCommand/>}/>
                <Route path="/online-session" element={<OnlineSession/>}/>
                <Route path="/offline-session" element={<OfflineSession/>}/>
                <Route path="/login-log" element={<LoginLog/>}/>
                <Route path="/info" element={<Info/>}/>
                <Route path="/setting" element={<Setting/>}/>
                <Route path="/job" element={<Job/>}/>
                <Route path="/file" element={<MyFile/>}/>
                <Route path="/access-security" element={<Security/>}/>
                <Route path="/access-gateway" element={<AccessGateway/>}/>
                <Route path="/storage" element={<Storage/>}/>
                <Route path="/strategy" element={<Strategy/>}/>
                <Route path="/strategy/:strategyId" element={<StrategyDetail/>}/>
                
                <Route path="/login-policy" element={<LoginPolicy/>}/>
                <Route path="/login-policy/:loginPolicyId" element={<LoginPolicyDetail/>}/>

                <Route path="/todo" element={<Todo/>}/>
                <Route path="/done" element={<Done/>}/>
                <Route path="/send" element={<Send/>}/>

                <Route path="/export-apply" element={<Export/>}/>
                <Route path="/import-apply" element={<Import/>}/>

                <Route path="/apply-audit" element={<ApplyAudit/>}/>
                <Route path="/task-process" element={<TaskProcess/>}/>

                <Route path="/oper-log" element={<OperLog/>}/>
                <Route path="/storage-log" element={<StorageLog/>}/>
                <Route path="/alarm-log" element={<AlarmLog/>}/>
                <Route path="/heart-log" element={<HeartLog/>}/>

                <Route path="/dict-type" element={<DictType/>}/>

                <Route path="/sensitive-rule" element={<SensitiveRule/>}/>
                <Route path="/sensitive-rule-group" element={<SensitiveRuleGroup/>}/>
                <Route path="/sensitive-rule-group/:sensitiveRuleGroupId" element={<SensitiveRuleGroupDetail/>}/>
                
                <Route path="/apply" element={<Apply/>}/>
                <Route path="/audit" element={<Audit/>}/>
                <Route path="/task" element={<Task/>}/>
                
                <Route path="/device" element={<Device/>}/>

                <Route path="/sensitive-log" element={<SensitiveLog/>}/>
                
            </Route>

            <Route element={<UserLayout/>}>
                <Route path="/my-asset" element={<MyAsset/>}/>
                <Route path="/my-info" element={<MyInfo/>}/>
                <Route path="/my-import" element={<MyImport/>}/>
                <Route path="/my-export" element={<MyExport/>}/>

                <Route path="/my-file" element={<MyFile/>}/>
                <Route path="/my-command" element={<MyCommand/>}/>
            </Route>
        </Routes>
    );
}

export default App;
