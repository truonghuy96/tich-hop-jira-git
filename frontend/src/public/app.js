(function () {
  const output = document.getElementById("output");
  const tokenInput = document.getElementById("token");
  const backendUrlInput = document.getElementById("backendUrl");
  const saveSessionBtn = document.getElementById("saveSessionBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const ctxGroupIdInput = document.getElementById("ctxGroupId");
  const ctxLecturerIdInput = document.getElementById("ctxLecturerId");
  const ctxStudentIdInput = document.getElementById("ctxStudentId");
  const applyContextBtn = document.getElementById("applyContextBtn");
  const viewJsonBtn = document.getElementById("viewJsonBtn");
  const viewTableBtn = document.getElementById("viewTableBtn");
  const tableOutput = document.getElementById("tableOutput");
  const storageKey = "pm_tool_session";
  const currentRole = window.APP_ROLE || "THANH_VIEN";
  let outputMode = "json";
  let latestData = null;

  function backendUrl() {
    return backendUrlInput.value.trim().replace(/\/$/, "");
  }

  function renderTable(data) {
    tableOutput.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
      tableOutput.innerHTML = '<p class="hint">Không có dữ liệu bảng phù hợp.</p>';
      return;
    }

    const columns = Object.keys(data[0]);
    const rows = data
      .map(
        (item) =>
          `<tr>${columns.map((col) => `<td>${item[col] ?? ""}</td>`).join("")}</tr>`
      )
      .join("");

    tableOutput.innerHTML = `
      <table class="data-table">
        <thead><tr>${columns.map((col) => `<th>${col}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function show(data) {
    latestData = data;
    if (outputMode === "json") {
      output.style.display = "block";
      tableOutput.style.display = "none";
      output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      return;
    }

    output.style.display = "none";
    tableOutput.style.display = "block";
    if (typeof data === "string") {
      tableOutput.innerHTML = `<p>${data}</p>`;
      return;
    }

    if (Array.isArray(data)) {
      renderTable(data);
      return;
    }

    // Convert object to one-row table for readability
    renderTable([data]);
  }

  function saveSession() {
    const data = {
      backendUrl: backendUrlInput.value.trim(),
      token: tokenInput.value.trim(),
      role: currentRole,
      ctxGroupId: ctxGroupIdInput.value.trim(),
      ctxLecturerId: ctxLecturerIdInput.value.trim(),
      ctxStudentId: ctxStudentIdInput.value.trim()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    show({ message: "Đã lưu phiên làm việc", data });
  }

  function loadSession() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.backendUrl) backendUrlInput.value = data.backendUrl;
      if (data.token) tokenInput.value = data.token;
      if (data.ctxGroupId) ctxGroupIdInput.value = data.ctxGroupId;
      if (data.ctxLecturerId) ctxLecturerIdInput.value = data.ctxLecturerId;
      if (data.ctxStudentId) ctxStudentIdInput.value = data.ctxStudentId;

      if (data.role && data.role !== currentRole) {
        show("Vai trò phiên lưu khác trang hiện tại. Vui lòng đăng nhập lại đúng vai trò.");
      }
    } catch (err) {
      show(`Không đọc được phiên đã lưu: ${err.message}`);
    }
  }

  function clearSession() {
    localStorage.removeItem(storageKey);
    tokenInput.value = "";
    ctxGroupIdInput.value = "";
    ctxLecturerIdInput.value = "";
    ctxStudentIdInput.value = "";
    show("Đã đăng xuất.");
    window.location.href = "/dang-nhap";
  }

  function setIfEmpty(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach((input) => {
      if (input instanceof HTMLInputElement && !input.value.trim()) {
        input.value = value;
      }
    });
  }

  function applyContextToForms() {
    const groupId = ctxGroupIdInput.value.trim();
    const lecturerId = ctxLecturerIdInput.value.trim();
    const studentId = ctxStudentIdInput.value.trim();

    setIfEmpty('input[name="groupId"]', groupId);
    setIfEmpty('input[name="idNhom"]', groupId);
    setIfEmpty('input[name="idGiangVien"]', lecturerId);
    setIfEmpty('input[name="idSinhVien"]', studentId);

    show("Đã tự điền ngữ cảnh vào các form trống.");
  }

  async function callApi(path, options = {}) {
    const token = tokenInput.value.trim();
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${backendUrl()}${path}`, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      throw new Error(typeof payload === "string" ? payload : JSON.stringify(payload));
    }
    return payload;
  }

  function formDataToObject(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function bindForm(formId, handler) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const result = await handler(formDataToObject(form));
        show(result);
      } catch (err) {
        show(`Lỗi: ${err.message}`);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await callApi("/api/auth/logout", { method: "POST" });
      } catch (err) {
        // Keep logout behavior even when backend logout fails.
      }
      clearSession();
    });
  }

  bindForm("createUserForm", (form) =>
    callApi("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: form.username,
        hoTen: form.hoTen,
        email: form.email,
        maVaiTro: form.maVaiTro
      })
    })
  );

  bindForm("updateRoleForm", (form) =>
    callApi(`/api/users/${form.userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: form.role })
    })
  );

  bindForm("deleteUserForm", (form) => callApi(`/api/users/${form.userId}`, { method: "DELETE" }));

  bindForm("createGroupForm", (form) =>
    callApi("/api/groups", {
      method: "POST",
      body: JSON.stringify({ tenNhom: form.tenNhom, deTai: form.deTai })
    })
  );

  bindForm("assignLecturerForm", (form) =>
    callApi(`/api/groups/${form.groupId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ idGiangVien: form.idGiangVien })
    })
  );

  bindForm("getGroupsForm", (form) => callApi(`/api/groups?idGiangVien=${encodeURIComponent(form.idGiangVien)}`));
  bindForm("groupDetailForm", (form) => callApi(`/api/groups/${form.groupId}`));
  bindForm("groupMembersForm", (form) => callApi(`/api/groups/${form.groupId}/members`));

  bindForm("getRequirementsForm", (form) =>
    callApi(`/api/tasks/yeu-cau?idNhom=${encodeURIComponent(form.idNhom)}`)
  );
  bindForm("getPersonalTasksForm", (form) =>
    callApi(`/api/tasks/nhiem-vu?idSinhVien=${encodeURIComponent(form.idSinhVien)}`)
  );
  bindForm("updateTaskStatusForm", (form) =>
    callApi(`/api/tasks/nhiem-vu/${encodeURIComponent(form.taskId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: form.status })
    })
  );

  bindForm("configJiraForm", (form) =>
    callApi(`/api/config/${encodeURIComponent(form.idNhom)}/jira`, {
      method: "POST",
      body: JSON.stringify({ url: form.url, token: form.token })
    })
  );

  bindForm("configGithubForm", (form) =>
    callApi(`/api/config/${encodeURIComponent(form.idNhom)}/github`, {
      method: "POST",
      body: JSON.stringify({ repo: form.repo, token: form.token, since: form.since })
    })
  );

  bindForm("syncJiraForm", (form) => callApi(`/api/sync/${encodeURIComponent(form.idNhom)}/jira`, { method: "POST" }));
  bindForm("syncGithubForm", (form) =>
    callApi(`/api/sync/${encodeURIComponent(form.idNhom)}/github`, { method: "POST" })
  );

  const mappingBtn = document.getElementById("mappingBtn");
  if (mappingBtn) {
    mappingBtn.addEventListener("click", async () => {
      try {
        const data = await callApi("/api/sync/mapping", { method: "POST" });
        show(data);
      } catch (err) {
        show(`Lỗi: ${err.message}`);
      }
    });
  }

  bindForm("progressForm", (form) =>
    callApi(`/api/reports/${encodeURIComponent(form.idNhom)}/progress`)
  );
  bindForm("commitsForm", (form) => callApi(`/api/reports/${encodeURIComponent(form.idNhom)}/commits`));
  bindForm("contributionsForm", (form) =>
    callApi(`/api/reports/${encodeURIComponent(form.idNhom)}/contributions`)
  );

  bindForm("exportForm", async (form) => {
    const url = `${backendUrl()}/api/reports/${encodeURIComponent(form.idNhom)}/export`;
    window.open(url, "_blank");
    return { message: "Đã mở file CSV ở tab mới.", url };
  });

  saveSessionBtn.addEventListener("click", saveSession);
  applyContextBtn.addEventListener("click", () => {
    applyContextToForms();
    saveSession();
  });
  viewJsonBtn.addEventListener("click", () => {
    outputMode = "json";
    if (latestData !== null) show(latestData);
  });
  viewTableBtn.addEventListener("click", () => {
    outputMode = "table";
    if (latestData !== null) show(latestData);
  });
  loadSession();
})();
