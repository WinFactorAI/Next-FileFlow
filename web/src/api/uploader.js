import request from "../common/request";
import Api from "./api";

class UploaderApi extends Api {
    constructor() {
        super("uploader");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
 

    uploadFile = async (data) => {
        let result = await request.post(`/${this.group}/uploadFile`, data);
        return result['data'];
    }

    chunk = async (data) => {
        let result = await request.post(`/${this.group}/chunk`, data);
        return result['data'];
    }

 
}

let uploaderApi = new UploaderApi();
export default uploaderApi;