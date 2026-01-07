import request from "../common/request";
import Api from "./api";

class UserApi extends Api {
    constructor() {
        super("users");
    }

    resetTotp = async (id) => {
        let result = await request.post(`/${this.group}/${id}/reset-totp`);
        return result['code'] === 1;
    }

    changePassword = async (id, password) => {
        let formData = new FormData();
        formData.set('password', password);
        let result = await request.post(`/${this.group}/${id}/change-password`, formData);
        return result['code'] === 1;
    }

    changeStatus = async (id, status) => {
        let result = await request.patch(`/${this.group}/${id}/status?status=${status}`);
        return result['code'] !== 1;
    }

    getAllUserByRole = async (roleId) => {
        let result = await request.get(`/${this.group}/${roleId}/role-type`);
        return result['data'];
    }
}

const userApi = new UserApi();
export default userApi;