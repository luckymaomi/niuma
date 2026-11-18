const FILE_NAME = "琨哥鼓励器.html";

function triggerDownload(html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function isSelfContainedPage(): boolean {
  return Array.from(document.scripts).some(
    (script) =>
      script.type === "module" &&
      !script.src &&
      (script.textContent?.length ?? 0) > 800,
  );
}

async function tryFetchPacked(): Promise<string | null> {
  const candidates = [`./${FILE_NAME}`, `/${FILE_NAME}`];
  for (const href of candidates) {
    try {
      const res = await fetch(href, { cache: "no-cache" });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
        return text;
      }
    } catch {
      // try next
    }
  }
  return null;
}

/** 网页端导出单页 HTML；优先拉打包好的文件，否则从当前自包含页序列化。 */
export async function downloadSinglePage(): Promise<{ ok: boolean; message: string }> {
  const packed = await tryFetchPacked();
  if (packed) {
    triggerDownload(packed);
    return { ok: true, message: "单页已开始下载" };
  }

  if (isSelfContainedPage()) {
    triggerDownload(`<!DOCTYPE html>\n${document.documentElement.outerHTML}`);
    return { ok: true, message: "单页已开始下载" };
  }

  return {
    ok: false,
    message: "当前还不能导出单页，请先生成单页后再打开使用",
  };
}
