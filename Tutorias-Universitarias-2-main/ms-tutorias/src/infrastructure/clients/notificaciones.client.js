const axios = require('axios');
const { notificacionesServiceUrl } = require('../../config');

const enviarEmail = async (payload) => {
    const url = `${notificacionesServiceUrl}/email`;
    const response = await axios.post(url, payload);
    return response.data;
};

module.exports = { enviarEmail };
