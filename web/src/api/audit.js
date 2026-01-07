import request from "../common/request";
import Api from "./api";

class AuditApi extends Api{
    constructor() {
        super("audit");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
}

let auditApi = new AuditApi();
export default auditApi;