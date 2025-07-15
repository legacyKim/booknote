import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export type tFileList = {
  files: string[];
  fileAdd: boolean;
  taskAdd: boolean;
  setRecentFiles: React.Dispatch<React.SetStateAction<string>>;
  setFileAdd: React.Dispatch<React.SetStateAction<boolean>>;
  bookListClose: boolean;
  taskListClose: boolean;
  setBookListClose: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FileList({
  files,
  fileAdd,
  taskAdd,
  setFileAdd,
  setRecentFiles,
  bookListClose,
  taskListClose,
  setBookListClose,
}: tFileList) {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const [fileAddDelay, setFileAddDelay] = useState<boolean>(false);
  useEffect(() => {
    if (fileAdd || taskAdd) {
      setFileAddDelay(true);
    } else {
      const timer = setTimeout(() => {
        setFileAddDelay(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [fileAdd || taskAdd]);

  return (
    <div className={`book ${fileAddDelay ? "off" : ""}`}>
      <button
        type="button"
        onClick={() => {
          if (bookListClose) {
            setBookListClose(false);
          } else {
            setBookListClose(true);
          }
        }}
        className={`icon-th-list ${taskListClose ? "task_on" : ""} ${
          bookListClose ? "on " : ""
        }`}
        aria-label="list open/close button"
      ></button>

      <ul className={`book_list ${bookListClose ? "on" : ""}`}>
        <button
          className={`book_add icon-ok ${bookListClose ? "on" : ""}`}
          onClick={() => {
            setFileAdd(true);
          }}
          aria-label="file add"
        ></button>

        {files.map((f) => (
          <li key={f}>
            <Link
              className={activeFile === f ? "active" : ""}
              to={`/file/${f}`}
              onClick={() => {
                setActiveFile(f);
                setRecentFiles(f);
              }}
            >
              {decodeURIComponent(f).replace(/\.txt$/, "")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
