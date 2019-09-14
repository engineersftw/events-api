const express = require('express')
const router = express.Router()

const db = require('../models/index')
const Op = db.Sequelize.Op

async function fetchGroup (platform, urlname) {
  return db.Group
    .findOne({
      where: {
        active: true,
        platform: platform,
        urlname: { [Op.iLike]: urlname }
      }
    })
}

async function blackListGroup (group) {
  await group.update({
    blacklisted: true
  })

  return db.sequelize.query(
    'UPDATE "Events" SET active = false WHERE platform = ? AND group_id = ?',
    {
      replacements: [group.platform, group.platform_identifier],
      type: db.sequelize.QueryTypes.UPDATE
    }
  )
}

function checkAdminToken (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' })
  }

  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(403).json({ error: 'Invalid Token!' })
  }
  next()
}

router.get('/:platform/:urlname', async function (req, res, next) {
  try {
    const { platform, urlname } = req.params
    const group = await fetchGroup(platform, urlname)

    res.json(group || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:platform/:urlname/blacklist', checkAdminToken, async function (req, res, next) {
  try {
    const { platform, urlname } = req.params
    const group = await fetchGroup(platform, urlname)

    const result = await blackListGroup(group)

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
