import qs from "qs";
import request from "../common/request";
import Api from "./api";

class ApplyApi extends Api {
    constructor() {
        super("apply");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    getImportDevice = async () => {
        let result = await request.get(`/${this.group}/getImportDevice`);
        return result['data'];
    }
    getSelectFileInfo = async (id) => {
        let result = await request.get(`/${this.group}/${id}/getSelectFileInfo`);
        return result['data'];
    }

    selectFile = async (data) => {
        let result = await request.post(`/${this.group}/selectFile`, data);
        return result['data'];
    }
    antiVirus = async (data) => {
        let result = await request.post(`/${this.group}/antiVirus`, data);
        return result['data'];
    }

    uploadFile = async (data) => {
        let result = await request.post(`/${this.group}/uploadFile`, data);
        return result['data'];
    }


    getSendPaging = async (params) => {
        let paramsStr = qs.stringify(params);
        let result = await request.get(`/${this.group}/send/paging?${paramsStr}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    burn = async (data) => {
        let result = await request.post(`/${this.group}/burn`, data);
        return result['data'];
    }

    approval = async (data) => {
        let result = await request.post(`/${this.group}/approval`, data);
        return result['data'];
    }

    sensitiveScan = async (id) => {
        let result = await request.get(`/${this.group}/${id}/sensitive-scan`);
        return result['code']===1;
    }
    sensitiveTestScan = async (data) => {
        let result = await request.post(`/${this.group}/sensitive-test-scan`,data);
        return result['data'];
    }
}

let applyApi = new ApplyApi();
export default applyApi;