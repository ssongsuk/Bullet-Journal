class JournalApi {
  baseUrl = "http://localhost:8080/api/";

  fetchData(url, callBack, errCallBack) {
    let fullUrl = this.baseUrl + url;

    fetch(fullUrl)
      .then((res) => res.json())
      .then(
        (result) => {
          if (callBack) {
            callBack(result);
          }
        },
        (error) => {
          if (errCallBack) {
            errCallBack(error);
          }
        }
      );
  }

  postData(url, data, callBack, errCallBack) {
    let fullUrl = this.baseUrl + url;
    fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          if (callBack) {
            callBack(result);
          }
        },
        (error) => {
          if (errCallBack) {
            errCallBack(error);
          }
        }
      );
  }

  deleteById(url, id, callBack, errCallBack) {
    let fullUrl = this.baseUrl + url;
    fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          if (callBack) {
            callBack(result);
          }
        },
        (error) => {
          if (errCallBack) {
            errCallBack(error);
          }
        }
      );
  }
}

export default JournalApi;
