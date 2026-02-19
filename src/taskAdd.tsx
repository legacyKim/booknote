import { useState, useEffect } from "react";

type tTaskAdd = {
  setNewTask: React.Dispatch<React.SetStateAction<boolean>>;
  taskAdd: boolean;
  setTaskAdd: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TaskAdd({ setNewTask, taskAdd, setTaskAdd }: tTaskAdd) {
  const [title, setTitle] = useState("");

  const taskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title === "") {
      alert("주제를 입력해 주세요.");
      return;
    }

    const newContent = {
      title,
      content: [],
    };

    try {
      const res = await fetch("http://localhost:3001/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });

      if (!res.ok) throw new Error("Failed to save task");

      setTitle("");

      setNewTask(true);
      setTaskAdd(false);

      alert("파일이 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className={`popup fixed ${taskAdd ? "fixed_show" : ""}`}>
      <form
        onSubmit={taskSubmit}
        className={`${taskAdd ? "transform_top" : ""}`}
      >
        <span>TASK SAVE</span>
        <div className="input_box">
          <label>title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              const filtered = value.replace(
                /[^\p{Script=Hangul}a-zA-Z0-9\s]/gu,
                ""
              );
              setTitle(filtered);
            }}
            className="border p-1 ml-2"
          />
        </div>

        <button type="submit" className="save_btn" aria-label="save">
          Save
        </button>
        <button
          type="button"
          className="cancel_btn"
          onClick={() => {
            setTaskAdd(false);
          }}
          aria-label="cancel"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
