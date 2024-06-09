# Importing needed components from flask and sqlite3 modules
from flask import Flask, render_template, redirect
import sqlite3

# Create our flask web app 
app = Flask(__name__)

# This function is responsible for fetching data from sqlite database when returning many rows or columns
def FetchData(query, placeholder):
    conn = sqlite3.connect("database.db")
    return conn.execute(query, placeholder).fetchall()

# This function is responsible for fetching data from sqlite database when returning scaler value
def FetchScalar(query, placeholder):
    return FetchData(query, placeholder)[0][0]

# Define index route which redirect to DeanView
@app.route("/")
def index():
    return redirect("/DeanView")

# Define the DeanView route and render the template and pass needed data to the template 
@app.route("/DeanView")
def Deanv():
    stats = FetchData("SELECT accepted * 1.0 / all_s * 100, enrolled * 1.0 / accepted * 100, graduated * 1.0 / enrolled * 100 FROM (SELECT COUNT(*) AS graduated FROM Student WHERE status = 3) JOIN (SELECT COUNT(*) AS enrolled FROM Student WHERE status >= 2) JOIN (SELECT COUNT(*) AS accepted FROM Student WHERE status >= 1) JOIN (SELECT COUNT(*) AS all_s FROM Student)", [])[0]
    numberOfApplicants = FetchScalar("SELECT COUNT(*) FROM Student WHERE status = 0", [])
    ranks = FetchData("SELECT national, international FROM UniversityRanking ORDER BY id DESC LIMIT 1", [])[0] 
    diff_n = FetchScalar("SELECT prev.national - curr.national FROM (SELECT * FROM (SELECT * FROM UniversityRanking ORDER BY id DESC LIMIT 2) ORDER BY id LIMIT 1) AS prev JOIN (SELECT * FROM UniversityRanking ORDER BY id DESC LIMIT 1) AS curr", [])
    diff_i = FetchScalar("SELECT prev.international - curr.international FROM (SELECT * FROM (SELECT * FROM UniversityRanking ORDER BY id DESC LIMIT 2) ORDER BY id LIMIT 1) AS prev JOIN (SELECT * FROM UniversityRanking ORDER BY id DESC LIMIT 1) AS curr", [])
    gender = FetchData("SELECT M, F FROM (SELECT COUNT(*) AS M FROM Student WHERE gender = 0) JOIN (SELECT COUNT(*) AS F FROM Student WHERE gender = 1)", [])[0]
    school_names = FetchData("SELECT name FROM School", [])
    return render_template("dean.html", applicants=numberOfApplicants, acceptance=round(stats[0], 2), enrollment=round(stats[1], 2), graduation=round(stats[2], 2), rank_n=ranks[0], rank_i=ranks[1], diff_n=diff_n, diff_i=diff_i, males=gender[0], females=gender[1], school_names=school_names)

# Define the TeachingEffectivenessUnitView route and render the template and pass needed data to the template 
@app.route("/TeachingEffectivenessUnitView")
def Teuv():
    school_names = FetchData("SELECT name FROM School", [])
    return render_template("teu.html", school_names=school_names)

# Define API route to fetch GPA of students in a certain school data using id of school
@app.route("/SchoolGPA/<id>")
def fetchSchoolGPA(id):
    return FetchData("SELECT cGPA FROM Student WHERE school_id = ? AND cGPA > 0", [int(id)])

# Define API route to fetch count and revenue of research in each field 
@app.route("/FetchResearchData")
def fetchResearchData():
    return FetchData("SELECT field, COUNT(*), SUM(revenue) FROM Research GROUP BY field", [])

# Define API route to fetch students count in a school in specific year using the year and id of school
@app.route("/FetchSchoolStudentsData/<year>/<school_id>")
def fetchSchoolStudents(year, school_id):
    return FetchData("SELECT COUNT(*) FROM (SELECT year, school_id, student_id, COUNT(*) FROM StudentGrades JOIN Student ON Student.id = student_id GROUP BY year, school_id, student_id) WHERE year = ? AND school_id = ?", [year, school_id])

# Define API route to fetch each school name and count of students in this school
@app.route("/FetchSchoolStudentsData")
def fetchSchoolStudentsAll():
    return FetchData("SELECT School.name, COUNT(*) FROM Student JOIN School ON school_id = School.id GROUP BY school_id", [])

# Define API route to fetch all national and international ranks of the university
@app.route("/FetchRanks")
def fetchRanks():
    return FetchData("SELECT year, national, international FROM UniversityRanking", [])

# Define API route to fetch all students GPAs in a certain school, year and semester by taking school id, year and semester
@app.route("/FetchGPAs/<school>/<year>/<semester>")
def fetchGPAs(school, year, semester):
    return FetchData("SELECT GPA FROM StudentsGPA JOIN Student ON Student.id = student_id WHERE school_id = ? AND year = ? AND semester = ?", [school, year, semester])

# Define API route to fetch top instructors type, name and average rating in a certain school, year and semester by taking school id, year and semester
@app.route("/FetchTopInstructors/<school>/<year>/<semester>")
def fetchTopInstructors(school, year, semester):
    return FetchData("SELECT Instructor.type, name, AVG(rating) FROM InstructorRatings JOIN Instructor ON instructor_id = Instructor.id WHERE school_id = ? AND year = ? AND semester = ? GROUP BY instructor_id ORDER BY rating DESC LIMIT 10", [school, year, semester])

# This part is responsible for runing the web app on debug mode
if __name__ == '__main__':
    app.run(debug=True)