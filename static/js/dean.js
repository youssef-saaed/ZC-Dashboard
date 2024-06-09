// The code in this file is responsible for making number of applicants displayed in count up way from zero to the number of applicants

var applicantsdiv = document.getElementById("applicants-number");
var applicantsNumber = parseInt(applicantsdiv.innerText);
applicantsdiv.innerText = 0;
increaseOneInterval = window.setInterval(increaseOne, 40);

function increaseOne()
{
    var n = parseInt(applicantsdiv.innerText);
    applicantsdiv.innerText = n + 11;
    if (n >= applicantsNumber)
    {
        applicantsdiv.innerText = applicantsNumber;
        window.clearInterval(increaseOneInterval);
    }
}