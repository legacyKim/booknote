import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export type tTaskName = {
  searchOn: boolean;
  //   setNewFiles: React.Dispatch<React.SetStateAction<boolean>>;
  //   searchResMemo: string;
  //   bookListClose: boolean;
  //   memoBoxOn: boolean;
  //   setMemoBoxOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export type tFileContent = {
  topic: string;
  content: string;
};

export default function TaskView({ searchOn }: tTaskName) {
  const { taskname } = useParams();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState();

  const [tasknameInView, setTasknameInView] = useState<string>();
  const [newJsonData, setNewJsonData] = useState<boolean>(true);

  const [jsonData, setJsonData] = useState<tFileContent | null>(null);

  console.log(jsonData);

  useEffect(() => {
    if (taskname !== tasknameInView || newJsonData) {
      fetch(`http://localhost:3001/api/task/${taskname}`)
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
  }, [taskname, newJsonData, jsonData]);

  const topicRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const save = async () => {
    const topic = topicRef.current?.innerText || "";
    const content = contentRef.current?.innerHTML || "";

    const res = await fetch(`http://localhost:3001/api/task/${taskname}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic,
        content: content,
      }),
    });
    if (!res.ok) throw new Error("수정 실패");

    const updated = await fetch(`http://localhost:3001/api/task/${taskname}`);
    const data = await updated.json();
    setJsonData(data);
  };

  return (
    <div className="content">
      <div className="topic size_876">
        <h4 contentEditable="true" ref={topicRef}>
          {jsonData?.topic}
        </h4>
      </div>
      <div className="task_content size_876">
        <div
          contentEditable="true"
          dangerouslySetInnerHTML={{ __html: jsonData?.content || "" }}
          ref={contentRef}
        ></div>
      </div>
      <button
        className="task_save icon-ok"
        type="button"
        onClick={() => {
          save();
        }}
      ></button>
    </div>
  );
}
