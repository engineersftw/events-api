require('dotenv').config()

const db = require('../models/index')

const newGroup = {
  score: 1,
  id: 26743667,
  name: 'SGInnovate',
  status: 'active',
  link: 'https://www.meetup.com/SGInnovate/',
  urlname: 'SGInnovate',
  description: "<p>At SGInnovate, we launch, prove and scale 'deep tech' products borne out of science research. We believe Singapore has the resources and capabilities to 'tackle hard problems' that matter to people around the world. SGInnovate has been established to help ambitious and capable people to build 'technology-intensive' products borne out of science research.</p>\n<p>Join our community and get involved in innovation workshops, panel discussions and industry-leading events on AI, machine learning, medtech, robotics, blockchain, etc.</p>",
  created: 1512026948000,
  city: 'Singapore',
  untranslated_city: 'Singapore',
  country: 'SG',
  localized_country_name: 'Singapore',
  localized_location: 'Singapore, Singapore',
  state: '',
  join_mode: 'open',
  visibility: 'public',
  lat: 1.3,
  lon: 103.85,
  members: 4787,
  organizer: {
    id: 242041622,
    name: 'Tuan',
    bio: '',
    photo: {
      id: 272657979,
      highres_link: 'https://secure.meetupstatic.com/photos/member/4/6/3/b/highres_272657979.jpeg',
      photo_link: 'https://secure.meetupstatic.com/photos/member/4/6/3/b/member_272657979.jpeg',
      thumb_link: 'https://secure.meetupstatic.com/photos/member/4/6/3/b/thumb_272657979.jpeg',
      type: 'member',
      base_url: 'https://secure.meetupstatic.com'
    }
  },
  who: 'Members',
  key_photo: {
    id: 476987729,
    highres_link: 'https://secure.meetupstatic.com/photos/event/b/a/7/1/highres_476987729.jpeg',
    photo_link: 'https://secure.meetupstatic.com/photos/event/b/a/7/1/600_476987729.jpeg',
    thumb_link: 'https://secure.meetupstatic.com/photos/event/b/a/7/1/thumb_476987729.jpeg',
    type: 'event',
    base_url: 'https://secure.meetupstatic.com'
  },
  timezone: 'Asia/Singapore',
  next_event: {
    id: '263188028',
    name: 'Career Conversations: Hack Your Way into a Data Job',
    yes_rsvp_count: 67,
    time: 1566815400000,
    utc_offset: 28800000
  },
  category: {
    id: 34,
    name: 'Tech',
    shortname: 'tech',
    sort_name: 'Tech'
  },
  topics: [
    {
      id: 456,
      name: 'Artificial Intelligence',
      urlkey: 'ai',
      lang: 'en_US'
    },
    {
      id: 1954,
      name: 'Innovation',
      urlkey: 'innovation',
      lang: 'en_US'
    },
    {
      id: 18062,
      name: 'Big Data',
      urlkey: 'big-data',
      lang: 'en_US'
    },
    {
      id: 19882,
      name: 'Entrepreneurship',
      urlkey: 'entrepreneurship',
      lang: 'en_US'
    },
    {
      id: 21681,
      name: 'Startup Businesses',
      urlkey: 'startup-businesses',
      lang: 'en_US'
    },
    {
      id: 79740,
      name: 'Internet of Things',
      urlkey: 'internet-of-things',
      lang: 'en_US'
    },
    {
      id: 98137,
      name: 'Machine Intelligence',
      urlkey: 'machine-intelligence',
      lang: 'en_US'
    },
    {
      id: 102811,
      name: 'Data Science',
      urlkey: 'data-science',
      lang: 'en_US'
    },
    {
      id: 108403,
      name: 'Technology Startups',
      urlkey: 'technology-startups',
      lang: 'en_US'
    },
    {
      id: 154954,
      name: 'Digital Health',
      urlkey: 'digital-health',
      lang: 'en_US'
    },
    {
      id: 253511,
      name: 'Deep Tech',
      urlkey: 'deep-tech',
      lang: 'en_US'
    },
    {
      id: 650182,
      name: 'Medtech',
      urlkey: 'medtech',
      lang: 'en_US'
    },
    {
      id: 1448582,
      name: 'Artificial Intelligence Machine Learning Robotics',
      urlkey: 'artificial-intelligence-machine-learning-robotics',
      lang: 'en_US'
    },
    {
      id: 1456952,
      name: 'Deep Learning',
      urlkey: 'deep-learning',
      lang: 'en_US'
    },
    {
      id: 1493232,
      name: 'Blockchain',
      urlkey: 'blockchain',
      lang: 'en_US'
    }
  ],
  meta_category: {
    id: 292,
    shortname: 'tech',
    name: 'Tech',
    sort_name: 'Tech',
    photo: {
      id: 450131949,
      highres_link: 'https://secure.meetupstatic.com/photos/event/2/e/a/d/highres_450131949.jpeg',
      photo_link: 'https://secure.meetupstatic.com/photos/event/2/e/a/d/600_450131949.jpeg',
      thumb_link: 'https://secure.meetupstatic.com/photos/event/2/e/a/d/thumb_450131949.jpeg',
      type: 'event',
      base_url: 'https://secure.meetupstatic.com'
    },
    category_ids: [
      34
    ]
  }
}

// db.Group.create({
//   name: newGroup.name,
//   platform: 'meetup',
//   platform_identifer: newGroup['id']
// }).then( group => {
//   console.log(group)
// })

// db.Group
//   .findOrCreate({
//     where: {
//       platform: 'meetup',
//       platform_identifer: `${newGroup['id']}`
//     },
//     defaults: {
//       name: newGroup.name,
//       platform: 'meetup',
//       platform_identifer: `${newGroup['id']}`
//     }
//   }).then( ([group, created]) => {
//     // console.log(group)
//     // console.log(created)

//     group.update({
//       name: newGroup.name,
//       status: newGroup.status,
//       link: newGroup.link,
//       urlname: newGroup.urlname,
//       description: newGroup.description,
//       members: newGroup.members
//     }).then(() => {
//       console.log('Updated the record for ', newGroup.name)
//     })
//   })

async function scratch () {
  // const group = await db.Group.findOne({ where: { name: newGroup.name } })

  // console.log(group.name)

  const group = db.Group.build({ name: 'Junkie' })
  console.log(group)
}

scratch()
