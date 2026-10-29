// src/pages/NewTask.tsx
import { useRef } from "react";
import { useNavigate } from "react-router";
import TasksPage from "./Tasks";
import TaskFormModal from "../components/task/TaskFormModal";
import useDocumentTitle from "../hooks/useDocumentTitle";

/**
 * /tasks/new — the task list with the create form open. The home page's
 * task button lands here after login; cancelling returns to the list and a
 * created task opens on its own page.
 */
const NewTaskPage = () => {
  const navigate = useNavigate();
  const createdRef = useRef(false);
  useDocumentTitle("Нова задача");

  return (
    <>
      <TasksPage />
      <TaskFormModal
        isOpen
        mode="create"
        onCreated={(task) => {
          createdRef.current = true;
          navigate(`/tasks/${task.taskNumber}`, { replace: true });
        }}
        onOpenChange={(open) => {
          if (!open && !createdRef.current) {
            navigate("/tasks", { replace: true });
          }
        }}
      />
    </>
  );
};

export default NewTaskPage;
