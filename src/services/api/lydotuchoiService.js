import api from "../../utils/api";

export const lyDoTuChoiService = {
  async getAll() {
    const res = await api.get("/ly-do-tu-choi");
    return res.data;
  },
};

export default lyDoTuChoiService;
