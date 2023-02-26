SELECT
  document_id,
  createdAt,
  updatedAt,
  id,
  title,
  image,
  description,
  deadline,
  status,
  publicity,
  collectiveGoalId,
  numberOfAchievers,
  numberOfSupporters,
  numberOfSpectators,
  tasksCompleted,
  tasksTotal
FROM
  (
    SELECT
      document_id,
      FIRST_VALUE(operation) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) = "DELETE" AS is_deleted,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.createdAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS createdAt,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.updatedAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS updatedAt,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.id')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS id,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.title')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS title,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.image')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS image,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.description')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS description,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.deadline')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS deadline,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.status')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS status,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.publicity')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS publicity,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.collectiveGoalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS collectiveGoalId,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.numberOfAchievers')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS numberOfAchievers,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.numberOfSupporters')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS numberOfSupporters,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.numberOfSpectators')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS numberOfSpectators,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.tasksCompleted')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS tasksCompleted,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.tasksTotal')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS tasksTotal
    FROM
      `strive-journal.firestore_export.goals_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  createdAt,
  updatedAt,
  id,
  title,
  image,
  description,
  deadline,
  status,
  publicity,
  collectiveGoalId,
  numberOfAchievers,
  numberOfSupporters,
  numberOfSpectators,
  tasksCompleted,
  tasksTotal
