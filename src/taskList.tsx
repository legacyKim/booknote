import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export type tFileList = {
  fileAdd: boolean;
  taskAdd: boolean;
  task: string[];
  setTaskAdd: React.Dispatch<React.SetStateAction<boolean>>;
  taskListClose: boolean;
  setTaskListClose: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TaskList({
  fileAdd,
  taskAdd,
  task,
  setTaskAdd,
  taskListClose,
  setTaskListClose,
}: tFileList) {
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
  }, [fileAdd, taskAdd]);

  return (
    <div className={`book task ${fileAddDelay ? "off" : ""}`}>
      <button
        type="button"
        onClick={() => {
          if (taskListClose) {
            setTaskListClose(false);
          } else {
            setTaskListClose(true);
          }
        }}
        className={`${taskListClose ? "on icon-comment" : "icon-comment"}`}
        aria-label="list open/close button"
      ></button>

      <ul className={`book_list ${taskListClose ? "on" : ""}`}>
        <button
          className={`book_add icon-ok`}
          onClick={() => {
            setTaskAdd(true);
          }}
          aria-label="file add"
        ></button>
        {task.map((t) => (
          <li key={t}>
            <Link to={`/task/${t}`} onClick={() => {}}>
              {decodeURIComponent(t).replace(/\.txt$/, "")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
