import urlJoin from "url-join";
import axios from "axios";
import log from "./log.js";

function getNpmInfo(npmName) {
  // const cnpm = 'https://registry.npm.taobao.org'
  const registryUrl = "https://registry.npmjs.org";

  const url = urlJoin(registryUrl, npmName);

  return axios.get(url).then((res) => {
    try {
      return res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  });
}

export function getLatestVersion(npmName) {
  return getNpmInfo(npmName).then((data) => {
    if (!data["dist-tags"] || !data["dist-tags"].latest) {
      log.error("no latest version");
      return Promise.reject(new Error("no latest version"));
    }

    return data["dist-tags"].latest;
  });
}
