import Api from "./api";

class SensitiveRuleGroupMembersApi extends Api{
    constructor() {
        super("sensitive-rule-group-members");
    }
}

let sensitiveRuleGroupMembersApi = new SensitiveRuleGroupMembersApi();
export default sensitiveRuleGroupMembersApi;