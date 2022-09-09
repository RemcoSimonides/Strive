import { createGoal, createGoalSource, createGoalStakeholder, createMilestone, createPost, createStoryItem, StoryItem, User } from '@strive/model';
import { subSeconds } from 'date-fns';
import { db, functions, logger } from './internals/firebase';
import { getDocument, toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const goalsSnap = await db.collection('Goals').get()   
    // for (const goalDoc of goalsSnap.docs) {
    //   const goal = createGoal(toDate({ ...goalDoc.data(), id: goalDoc.id }))

    //   const postsSnap = await db.collection(`Goals/${goalDoc.id}/Posts`).get()
    //   const posts = postsSnap.docs.map(postDoc => createPost(toDate({ ...postDoc.data(), id: postDoc.id })))
    //   if (!posts.length) continue

    //   const milestonesSnap = await db.collection(`Goals/${goalDoc.id}/Milestones`).get()
    //   for (const milestoneDoc of milestonesSnap.docs) {
    //     const milestone = createMilestone(toDate({ ...milestoneDoc.data(), id: milestoneDoc.id }))

    //     if (milestone.status === 'failed' || milestone.status === 'succeeded') {

    //       const post = posts.find(p => p.id === milestone.id)
    //       if (!post) continue

    //       const user = await getDocument<User>(`Users/${post.uid}`)
          
    //       // create story item
    //       const date = subSeconds(post.createdAt, 10)
    //       const item = createStoryItem({
    //         createdAt: date,
    //         updatedAt: date,
    //         date,
    //         name: 'goalStoryPostCreated',
    //         source: createGoalSource({
    //           goal,
    //           milestone,
    //           postId: post.id,
    //           user
    //         })
    //       })
    //       db.collection(`Goals/${goal.id}/Story`).add(item)
    //     }
    //   }

    //   if (goal.isFinished) {
    //     const post = posts.find(p => p.id === goal.id)
    //     if (post) {
    //       const user = await getDocument<User>(`Users/${post.uid}`)
          
    //       // create story item
    //       const date = subSeconds(post.createdAt, 10)
    //       const item = createStoryItem({
    //         createdAt: date,
    //         updatedAt: date,
    //         date,
    //         name: 'goalStoryPostCreated',
    //         source: createGoalSource({
    //           goal,
    //           postId: post.id,
    //           user
    //         })
    //       })
    //       db.collection(`Goals/${goal.id}/Story`).add(item)
    //     }
    //   }
    // }


    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})