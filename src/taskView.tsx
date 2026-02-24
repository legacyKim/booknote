import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DownloadPopup from "./DownloadPopup";
import EditorToolbar from "./EditorToolbar";

export type tTaskName = {
  searchOn: boolean;
  downloadPopupOpen: boolean;
  setDownloadPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  //   setNewFiles: React.Dispatch<React.SetStateAction<boolean>>;
  //   searchResMemo: string;
  //   bookListClose: boolean;
  //   memoBoxOn: boolean;
  //   setMemoBoxOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export type tFileContent = {
  title: string;
  keywords?: string;
  content: string;
  updated_at?: string;
};

export default function TaskView({
  searchOn,
  downloadPopupOpen,
  setDownloadPopupOpen,
}: tTaskName) {
  const { taskname } = useParams();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState();

  const [tasknameInView, setTasknameInView] = useState<string>();
  const [newJsonData, setNewJsonData] = useState<boolean>(true);

  const [jsonData, setJsonData] = useState<tFileContent | null>(null);

  console.log(jsonData);

  useEffect(() => {
    if (!taskname) return;

    if (taskname !== tasknameInView || newJsonData) {
      fetch(`http://localhost:3001/api/task/${encodeURIComponent(taskname)}`)
        .then((res) => res.json())
        .then((data) => {
          setJsonData(data);
          setNewJsonData(false);
        })
        .catch((err) => {
          console.error(err);
          setNewJsonData(false);
        });
    }

    // 이전 목록 확인
    setTasknameInView(taskname);
  }, [taskname, newJsonData]);

  useEffect(() => {
    if (!jsonData) return;
    if (titleRef.current) {
      titleRef.current.innerText = jsonData.title || "";
    }
    if (contentRef.current) {
      contentRef.current.innerHTML = jsonData.content || "";
    }
  }, [jsonData]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const save = async () => {
    const title = titleRef.current?.innerText || "";
    const content = contentRef.current?.innerHTML || "";

    const res = await fetch(`http://localhost:3001/api/task/${encodeURIComponent(taskname || "")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });
    if (!res.ok) throw new Error("수정 실패");

    const updated = await fetch(`http://localhost:3001/api/task/${encodeURIComponent(taskname || "")}`);
    const data = await updated.json();
    setJsonData(data);
  };

  const uploadToGoogleDrive = async () => {
    if (!taskname) {
      alert("업로드할 파일이 없습니다.");
      return;
    }

    const filename = encodeURIComponent(taskname);

    try {
      const response = await fetch(
        `http://localhost:3001/api/upload-file/${filename}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderType: "task" }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("파일이 Google Drive에 성공적으로 업로드되었습니다!");
      } else {
        alert(`업로드 실패: ${result.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="content">
      <div className="title size_876">
        <h4
          contentEditable="true"
          ref={titleRef}
        ></h4>
        {jsonData?.keywords && (
          <div className="keywords">
            {jsonData.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
              .map((keyword, index) => (
                <span key={`${keyword}-${index}`}>{keyword}</span>
              ))}
          </div>
        )}
      </div>
      <span className="updated-data size_876">
        {jsonData?.updated_at && (
          <>
            마지막 수정일:{" "}
            {new Date(jsonData.updated_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            {new Date(jsonData.updated_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </>
        )}
      </span>
      {isEditorFocused && <EditorToolbar targetRef={contentRef} />}

      <div
        className="task_content size_876"
        ref={editorContainerRef}
        onFocusCapture={() => setIsEditorFocused(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as Node | null;
          if (nextTarget && editorContainerRef.current?.contains(nextTarget)) {
            return;
          }
          setIsEditorFocused(false);
        }}
      >
        <div
          contentEditable="true"
          ref={contentRef}
          onPaste={(e) => {
            e.preventDefault();
            const html = e.clipboardData.getData("text/html");
            const text = e.clipboardData.getData("text/plain");

            if (html) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              doc.querySelectorAll("[style]").forEach((el) => {
                el.removeAttribute("style");
              });
              doc.querySelectorAll("[class]").forEach((el) => {
                el.removeAttribute("class");
              });
              const cleaned = doc.body.innerHTML;
              document.execCommand("insertHTML", false, cleaned);
            } else {
              document.execCommand("insertText", false, text);
            }
          }}
        ></div>
      </div>

      <div className="memobox_on_off">
        <button
          className="icon-download-cloud"
          onClick={() => setDownloadPopupOpen(true)}
          title="Google Drive에서 다운로드"
        ></button>
        <button
          className="icon-upload-cloud-2"
          type="button"
          onClick={uploadToGoogleDrive}
          title="Google Drive에 업로드"
        ></button>
        <button
          className="task_save icon-ok"
          type="button"
          onClick={() => {
            save();
          }}
        ></button>
      </div>

      {/* DownloadPopup 컴포넌트 */}
      <DownloadPopup
        isOpen={downloadPopupOpen}
        onClose={() => setDownloadPopupOpen(false)}
      />
    </div>
  );
}
