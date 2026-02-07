import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";

import "./css/App.css";
import "./css/font.css";
import "./fontello/css/fontello.css";

import FileList from "./fileList";
import FileView from "./fileView";
import FileAdd from "./fileAdd";
import Search from "./fileSearch";
import SearchResult from "./fileSearchResult";
import Home from "./Home";

import TaskList from "./taskList";
import TaskView from "./taskView";
import TaskAdd from "./taskAdd";

function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<boolean>(true);
  const [recentFiles, setRecentFiles] = useState<string>("");

  const [searchText, setSearchText] = useState("");
  const [searchOn, setSearchOn] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);

  useEffect(() => {
    if (newFiles) {
      fetch("http://localhost:3001/api/files")
        .then((res) => res.json())
        .then((data) => {
          setFiles(data);
          setNewFiles(false); // fetch 완료 후만 false로
        })
        .catch((err) => {
          console.error(err);
          setNewFiles(false); // 에러 시에도 루프 방지
        });
    }
  }, [newFiles]);

  const [fileAdd, setFileAdd] = useState<boolean>(false);
  const [fileAddDelay, setFileAddDelay] = useState<boolean>(false);

  useEffect(() => {
    if (fileAdd) {
      setFileAddDelay(true);
    } else {
      const timer = setTimeout(() => {
        setFileAddDelay(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [fileAdd]);

  // searchRes => fileView
  const [searchResMemo, setSerachResMemo] = useState<string>("");

  // booklist open / close
  const [bookListClose, setBookListClose] = useState<boolean>(true);

  // memoBox active
  const [memoBoxOn, setMemoBoxOn] = useState<boolean>(true);

  // download popup
  const [downloadPopupOpen, setDownloadPopupOpen] = useState<boolean>(false);

  // task
  const [taskListClose, setTaskListClose] = useState<boolean>(false);

  const [task, setTask] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<boolean>(true);

  useEffect(() => {
    if (newTask) {
      fetch("http://localhost:3001/api/task")
        .then((res) => res.json())
        .then((data) => {
          setTask(data);
          setNewTask(false); // fetch 완료 후만 false로
        })
        .catch((err) => {
          console.error(err);
          setNewTask(false); // 에러 시에도 루프 방지
        });
    }
  }, [newTask]);

  const [taskAdd, setTaskAdd] = useState<boolean>(false);

  return (
    <>
      <div className="App">
        <FileList
          files={files}
          fileAdd={fileAdd}
          taskAdd={taskAdd}
          setRecentFiles={setRecentFiles}
          setFileAdd={setFileAdd}
          bookListClose={bookListClose}
          taskListClose={taskListClose}
          setBookListClose={setBookListClose}
        ></FileList>

        <TaskList
          fileAdd={fileAdd}
          taskAdd={taskAdd}
          task={task}
          setTaskAdd={setTaskAdd}
          taskListClose={taskListClose}
          setTaskListClose={setTaskListClose}
        ></TaskList>

        <main className={`${fileAddDelay ? "off" : ""}`}>
          <header>
            <Link to={`file/${recentFiles}`}>최근작업</Link>
            <Link to={`/search`}>검색결과</Link>

            <button
              type="button"
              onClick={() => {
                setSearchOn(true);
              }}
              aria-label="search"
            >
              검색
            </button>
          </header>

          <Search
            searchText={searchText}
            setSearchText={setSearchText}
            setSearchResult={setSearchResult}
            searchOn={searchOn}
            setSearchOn={setSearchOn}
          ></Search>

          <Routes>
            <Route path="/" element={<Home></Home>}></Route>
            <Route
              path="/file/:filename"
              element={
                <FileView
                  searchOn={searchOn}
                  setNewFiles={setNewFiles}
                  searchResMemo={searchResMemo}
                  bookListClose={bookListClose}
                  taskListClose={taskListClose}
                  memoBoxOn={memoBoxOn}
                  setMemoBoxOn={setMemoBoxOn}
                  downloadPopupOpen={downloadPopupOpen}
                  setDownloadPopupOpen={setDownloadPopupOpen}
                ></FileView>
              }
            />
            <Route
              path="/task/:taskname"
              element={
                <TaskView
                  searchOn={searchOn}
                  downloadPopupOpen={downloadPopupOpen}
                  setDownloadPopupOpen={setDownloadPopupOpen}
                ></TaskView>
              }
            ></Route>
            <Route
              path="/search"
              element={
                <SearchResult
                  searchText={searchText}
                  searchOn={searchOn}
                  searchResult={searchResult}
                  setSerachResMemo={setSerachResMemo}
                />
              }
            />
          </Routes>
        </main>
      </div>

      <FileAdd
        setNewFiles={setNewFiles}
        fileAdd={fileAdd}
        setFileAdd={setFileAdd}
      ></FileAdd>

      <TaskAdd
        setNewTask={setNewTask}
        taskAdd={taskAdd}
        setTaskAdd={setTaskAdd}
      ></TaskAdd>
    </>
  );
}

export default App;
