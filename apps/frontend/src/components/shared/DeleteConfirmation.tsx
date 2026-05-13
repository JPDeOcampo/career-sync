type Job = {
  id: string;
  roleTitle: string;
  company: string;
};

type Props = {
  items: Job[];
  idList: string[];
};

const DeleteConfirmationContent = ({ items, idList }: Props) => {
  const jobsToDelete = items.filter((job) => idList.includes(job.id));

  if (idList.length === 1) {
    const job = jobsToDelete[0];

    return (
      <>
        <p>
          Are you sure you want to delete your application for the{" "}
          <b>{job?.roleTitle}</b> role at <b>{job?.company}</b>?
        </p>

        <p className="my-2">This action cannot be undone.</p>
      </>
    );
  }

  return (
    <>
      <p>
        Are you sure you want to delete these <b>{idList.length}</b>{" "}
        applications?
      </p>

      <p className="my-2">This action cannot be undone.</p>

      <ul className="pl-8 pr-4 py-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 list-disc">
        {jobsToDelete.map((job) => (
          <li key={job.id}>
            <span className="font-bold">{job.roleTitle}</span> role at{" "}
            <span className="font-bold">{job.company}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default DeleteConfirmationContent;
