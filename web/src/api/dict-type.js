import request from "../common/request";
import Api from "./api";

class DistTypeApi extends Api{
    constructor() {
        super("dict-type");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
}

let distTypeApi = new DistTypeApi();
export default distTypeApi;