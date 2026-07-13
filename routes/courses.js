const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const localCourseCatalog = [
  { id: "c1", title: "Modern React with Redux", platform: "Udemy", category: "web development", link: "https://www.udemy.com" },
  { id: "c2", title: "Node.js Developer Bootcamp", platform: "Coursera", category: "web development", link: "https://www.coursera.org" },
  { id: "c3", title: "Python for Data Science and Machine Learning", platform: "Udemy", category: "data science", link: "https://www.udemy.com" },
  { id: "c4", title: "Machine Learning A-Z", platform: "Coursera", category: "artificial intelligence", link: "https://www.coursera.org" },
  { id: "c5", title: "Introduction to UI/UX Design Frameworks", platform: "edX", category: "ui/ux design", link: "https://www.edx.org" }
];

// @route    GET api/courses
// @desc     Fetch personalized course suggestions based on category
// @access   Private
router.get('/', auth, async (req, res) => {
  const category = req.query.category ? req.query.category.toLowerCase().trim() : '';

  try {
    if (!category) {
      return res.json(localCourseCatalog);
    }

    const filteredCourses = localCourseCatalog.filter(course => 
      course.category.includes(category) || category.includes(course.category)
    );

    res.json(filteredCourses.length > 0 ? filteredCourses : localCourseCatalog);
  } catch (err) {
    console.error("Course Service Error:", err.message);
    res.json(localCourseCatalog);
  }
});

module.exports = router;