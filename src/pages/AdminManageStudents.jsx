import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const AdminManageStudents = () => {

    const [students, setStudents] = useState([]);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    // Fetch students
    useEffect(() => {
        fetch(`${API_BASE}/api/student`)
            .then(res => res.json())
            .then(data => setStudents(data));
    }, []);

    // Delete student
    const deleteStudent = (id) => {

        Swal.fire({
            title: "Are you sure?",
            text: "This student will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {

            if (result.isConfirmed) {

                fetch(`${API_BASE}/api/student/${id}`, {
                    method: "DELETE"
                })
                    .then(res => res.json())
                    .then(() => {

                        setStudents(students.filter(student => student._id !== id));

                        Swal.fire(
                            "Deleted!",
                            "Student has been removed.",
                            "success"
                        );
                    });

            }

        });
    };

    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">Manage Students</h1>

            <table className="w-full border shadow">

                <thead>
                    <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {students.map((student) => (
                        <tr key={student._id} className="text-center">

                            <td className="border p-2">{student.rollNumber}</td>
                            <td className="border p-2">{student.name}</td>

                            <td className="border p-2">

                                <button
                                    onClick={() => deleteStudent(student._id)}
                                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default AdminManageStudents;