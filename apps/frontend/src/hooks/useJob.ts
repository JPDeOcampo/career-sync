import { useState } from "react";
import { store } from "@/store/store";
import { addJob, updateJob } from "@/store/slices/jobSlice";
import { JobApplication } from "@/@types/jobTypes";

const useJobHooks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  const handleAddJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = (job: JobApplication) => {
    if (editingJob) {
      store.dispatch(updateJob(job));
    } else {
      store.dispatch(addJob(job));
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleCloseModal = () => {
    console.log("close modal");
    setIsModalOpen(false);
    setEditingJob(null);
  };

  return {
    isModalOpen,
    editingJob,
    handleAddJob,
    handleEditJob,
    handleSaveJob,
    handleCloseModal,
  };
};

export default useJobHooks;
