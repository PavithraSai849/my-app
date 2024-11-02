import axiosInstance from "@/api/axiosInstance";
import { auth, db } from "@/firebase"; // Import initialized Firebase app
import { collection, addDoc, getDoc, getDocs, doc, setDoc, updateDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";


export async function registerService(signUpFormData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      signUpFormData.userEmail,
      signUpFormData.password
    );
    const user = userCredential.user;

    // Add user to Firestore database
    await setDoc(doc(db, "users", user.uid), {
      email: signUpFormData.userEmail,
      name: signUpFormData.userName,
      role: "user",
    });

    return {
      success: true,
      message: 'User registered successfully!',
      user: { uid: user.uid, email: user.email } // Return user data here
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: error.message };
  }
}

// User Login Service
export async function loginService(formData) {
  const { userEmail, password } = formData;

  const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
  const user = userCredential.user;

  return {
    success: true,
    data: {
      accessToken: await user.getIdToken(),
      user: {
        uid: user.uid,
        userEmail: user.email,
      },
    },
  };
}

export async function testUserCollectionAccess() {
  const usersCollectionRef = collection(db, "users");
  console.log(usersCollectionRef);
  const querySnapshot = await getDocs(usersCollectionRef);
  querySnapshot.forEach((doc) => {
    console.log(`Document ID: ${doc.id}, Data: `, doc.data());
  });
}

export async function checkAuthService() {
  const user = auth.currentUser; 
  console.log("Current User:", user); 

  if (user) {
    const userRef = doc(db, "users", user.uid); 
    console.log("User Reference:", userRef); 

    try {
      const userSnapshot = await getDoc(userRef); 
      console.log("User Snapshot Exists:", userSnapshot.exists()); 

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data(); 
        console.log("User Data:", userData); 
        return { success: true, data: { ...userData, uid: user.uid } }; 
      } else {
        console.warn("No document found for the UID:", user.uid);
      }
    } catch (error) {
      console.error("Error fetching user document:", error);
    }
  } else {
    console.warn("No user is currently logged in.");
  }
  return { success: false, data: null };
}

// export async function mediaUploadService(formData, onProgressCallback) {
//   const file = formData.get('file');

//   // Validate file size (in bytes)
//   const maxFileSize = 10 * 1024 * 1024; // 10 MB
//   if (file.size > maxFileSize) {
//     alert("File size exceeds 10 MB. Please choose a smaller file.");
//     return;
//   }

//   const { data } = await axiosInstance.post("/upload", formData, {
//     onUploadProgress: (progressEvent) => {
//       const percentCompleted = Math.round(
//         (progressEvent.loaded * 100) / progressEvent.total
//       );
//       onProgressCallback(percentCompleted);
//     },
//   });

//   return data;
// }


// export async function mediaBulkUploadService(formData, onProgressCallback) {
//   const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
//     onUploadProgress: (progressEvent) => {
//       const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//       onProgressCallback(percentCompleted);
//     },
//   });
//   return data;
// }

// export async function mediaDeleteService(id) {
//   const { data } = await axiosInstance.delete(`/media/delete/${id}`);
//   return data;
// }

// export async function fetchInstructorCourseListService() {
//   try {
//     const courseCollectionRef = collection(db, "courses");
//     const courseSnapshot = await getDocs(courseCollectionRef);
    
//     // Map through each document snapshot and get its data
//     const courses = courseSnapshot.docs.map((doc) => ({
//       id: doc.id, // Include the document ID
//       ...doc.data(), // Get the document data
//     }));

//     return { success: true, data: courses };
//   } catch (error) {
//     console.error("Error fetching course list:", error);
//     return { success: false, message: "Failed to fetch course list" };
//   }
// }

export async function mediaUploadService(formData, onProgressCallback) {
  const file = formData.get('file');

  // Validate file size (in bytes)
  const maxFileSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxFileSize) {
    console.error("File size exceeds 10 MB. Please choose a smaller file.");
    return; // Or handle this case in a user-friendly way
  }

  try {
    const { data } = await axiosInstance.post("/upload", formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgressCallback(percentCompleted);
      },
    });
    return data;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error; // Rethrow or handle the error appropriately
  }
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  try {
    const { data } = await axiosInstance.post("/bulk-upload", formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgressCallback(percentCompleted);
      },
    });
    return data;
  } catch (error) {
    console.error("Error during bulk upload:", error);
    throw error; // Rethrow or handle the error appropriately
  }
}

export async function mediaDeleteService(id) {
  try {
    const { data } = await axiosInstance.delete(`/delete/${id}`);
    return data;
  } catch (error) {
    console.error("Error during media deletion:", error);
    throw error; // Rethrow or handle the error appropriately
  }
}

export async function addNewCourseService(courseData) {
  // Filter out undefined values from courseData
  const sanitizedData = Object.fromEntries(
    Object.entries(courseData).filter(([_, value]) => value !== undefined)
  );

  try {
    const courseRef = await addDoc(collection(db, "courses"), sanitizedData);
    return { success: true, id: courseRef.id };
  } catch (error) {
    console.error("Error adding new course:", error);
    return { success: false, message: "Failed to add course" };
  }
}

export async function fetchInstructorCourseDetailsService(id) {
  try {
    const docRef = doc(db, "courses", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, message: "Course not found" };
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    return { success: false, message: "Failed to fetch course details" };
  }
}

export async function updateCourseByIdService(id, courseData) {
  try {
    // Log the courseData for debugging
    console.log("Updating course with ID:", id, "Data:", courseData);

    // Check for undefined values in courseData
    for (const key in courseData) {
      if (courseData[key] === undefined) {
        console.warn(`Skipping field "${key}" because its value is undefined`);
        delete courseData[key]; // Remove undefined fields to avoid errors
      }
    }

    const courseRef = doc(db, "courses", id);
    await updateDoc(courseRef, courseData);
    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, message: "Failed to update course" };
  }
}

export async function fetchStudentViewCourseListService(filters = {}) {
  const coursesRef = collection(db, "courses");

  // Build the query with filters
  const q = query(
    coursesRef,
    ...(filters?.category ? [where("category", "==", filters.category)] : []),
    ...(filters?.level ? [where("level", "==", filters.level)] : [])
  );

  const snapshot = await getDocs(q);
  const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return { success: true, data: courses };
}


export async function fetchStudentViewCourseDetailsService(courseId) {
  try {
    const courseRef = doc(db, "courses", courseId); // assumes collection name is 'courses'
    const courseSnapshot = await getDoc(courseRef);

    if (!courseSnapshot.exists()) {
      return {
        success: false,
        message: "No course details found",
        data: null,
      };
    }

    return {
      success: true,
      data: courseSnapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching course details:", error);
    return {
      success: false,
      message: "Some error occurred!",
    };
  }
}


export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);

  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const { data } = await axiosInstance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}
