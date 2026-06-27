// Australian leave types (NES-based) for worker leave requests.
module.exports = {
  "types": [
    {
      "id": "annual_leave",
      "label": "Annual leave",
      "paid": true,
      "note": "Paid time off for a holiday or a break — full-time workers build up 4 weeks a year."
    },
    {
      "id": "personal_carers_leave",
      "label": "Personal/carer's (sick) leave",
      "paid": true,
      "note": "Paid leave when you're unwell or need to care for a sick family or household member."
    },
    {
      "id": "compassionate_leave",
      "label": "Compassionate leave",
      "paid": true,
      "note": "2 paid days when a family or household member dies or has a serious illness or injury."
    },
    {
      "id": "unpaid_leave",
      "label": "Unpaid leave",
      "paid": false,
      "note": "Time off without pay when you've used up your other leave or it doesn't apply."
    },
    {
      "id": "long_service_leave",
      "label": "Long service leave",
      "paid": true,
      "note": "Paid leave you earn after working for the same employer for a long time (rules vary by state)."
    },
    {
      "id": "time_in_lieu_rdo",
      "label": "Time in lieu / RDO",
      "paid": true,
      "note": "A paid day off to make up for extra hours you've already worked."
    }
  ],
  "tip": "Please give as much notice as you can — final approval is up to your manager."
};
