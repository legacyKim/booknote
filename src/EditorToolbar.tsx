import type { RefObject } from "react";

type EditorToolbarProps = {
  targetRef?: RefObject<HTMLElement | null>;
  className?: string;
};

export default function EditorToolbar({
  targetRef,
  className = "",
}: EditorToolbarProps) {
  const focusTarget = () => {
    targetRef?.current?.focus();
  };

  const applyFormat = (command: string, value?: string) => {
    focusTarget();
    document.execCommand(command, false, value);
    focusTarget();
  };

  const handleLink = () => {
    const url = window.prompt("URL을 입력하세요:");
    if (!url) return;
    applyFormat("createLink", url);
  };

  const handleImage = () => {
    const imageUrl = window.prompt("이미지 URL을 입력하세요:");
    if (!imageUrl) return;
    document.execCommand("insertImage", false, imageUrl);
    focusTarget();
  };

  return (
    <div
      className={`editor_toolbar ${className}`.trim()}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button type="button" onClick={() => applyFormat("bold")} title="Bold">
        <i className="icon-bold"></i>
      </button>
      <button type="button" onClick={() => applyFormat("italic")} title="Italic">
        <i className="icon-italic"></i>
      </button>
      <button
        type="button"
        onClick={() => applyFormat("underline")}
        title="Underline"
      >
        <i className="icon-underline"></i>
      </button>
      <span className="toolbar_separator"></span>

      <button type="button" onClick={handleLink} title="Link">
        <i className="icon-link"></i>
      </button>
      {/* <button type="button" onClick={handleImage} title="Image">
        <i className="icon-picture"></i>
      </button> */}
      <span className="toolbar_separator"></span>

      <button
        type="button"
        onClick={() => applyFormat("formatBlock", "<h1>")}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => applyFormat("formatBlock", "<h2>")}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => applyFormat("formatBlock", "<h3>")}
        title="Heading 3"
      >
        H3
      </button>
      <span className="toolbar_separator"></span>

      <button
        type="button"
        onClick={() => applyFormat("insertUnorderedList")}
        title="Bullet List"
      >
        <i className="icon-list-bullet"></i>
      </button>
      <button
        type="button"
        onClick={() => applyFormat("insertOrderedList")}
        title="Numbered List"
      >
        <i className="icon-list-numbered"></i>
      </button>
      <button
        type="button"
        onClick={() => applyFormat("formatBlock", "<blockquote>")}
        title="Quote"
      >
        <i className="icon-quote-left"></i>
      </button>

      {/* <button
        type="button"
        onClick={() => applyFormat("insertHorizontalRule")}
        title="Horizontal Line"
      >
        <i className="icon-minus"></i>
      </button>
      <button
        type="button"
        onClick={() => applyFormat("removeFormat")}
        title="Clear Formatting"
      >
        <i className="icon-eraser"></i>
      </button> */}
    </div>
  );
}
