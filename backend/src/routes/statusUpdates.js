const express = require('express')
const router = express.Router()
const statusUpdates = require('../helpers/statusUpdates')
const statuses = require('../helpers/statuses')
const students = require('../helpers/students')

const { UniqueViolationError } = require('objection')

router.post('/', async (req, res) => {
  // If request does not contain PreviousStatusID and contains a PreviousStatusString
  if (req.body.PreviousStatusID == null && req.body.PreviousStatusString != null) {
    const prevStatus = await statuses.getStatusByStatusString(req.body.PreviousStatusString)
    req.body.PreviousStatusID = prevStatus.StatusID
    delete req.body.PreviousStatusString
  }

  // If request does not contain NextStatusID and contains a NextStatusString
  if (req.body.NextStatusID == null && req.body.NextStatusString != null) {
    const nextStatus = await statuses.getStatusByStatusString(req.body.NextStatusString)
    req.body.NextStatusID = nextStatus.StatusID
    delete req.body.NextStatusString
  }

  if (req.body.PreviousStatusID === req.body.NextStatusID) {
    return res.status(422).send({
      message: 'Previous Status and Next Status should not be the same.',
      type: 'StatusError',
      data: {
        previousStatus: req.body.PreviousStatusID,
        nextStatus: req.body.NextStatusID
      }
    })
  }

  const student = await students.getStudentById(req.body.StudentID)

  if (student.StatusID !== req.body.PreviousStatusID) {
    return res.status(409).send({
      message: 'Previous status must match current student status.',
      type: 'StatusMismatch',
      data: {
        submittedStatus: req.body.PreviousStatusID,
        actualStatus: student.StatusID
      }
    })
  }
  
  const result = await statusUpdates.addStatusUpdate(req.body)

  // handle error
  if (result.err) {
    const err = result.err
    if (err instanceof UniqueViolationError) {
      res.status(409).send({
        message: err.message,
        type: 'UniqueViolation',
        data: {
          columns: err.columns,
          table: err.table,
          constraint: err.constraint
        }
      })
    } else {
      res.status(500).send({
        message: err.message,
        type: 'UnknownError',
        data: {}
      })
    }

    return
  }

  res.status(200).json(result)
})

module.exports = router
