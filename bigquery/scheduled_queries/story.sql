SELECT
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  id,
  name,
  date,
  goalId,
  userId,
  milestoneId,
  postId
FROM
  (
    SELECT
      document_id,
      JSON_EXTRACT_SCALAR(path_params, '$.goalId') AS param_goalId,
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
        JSON_EXTRACT_SCALAR(data, '$.name')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS name,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.date')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS date,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.goalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS goalId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.userId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS userId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.milestoneId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS milestoneId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.postId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS postId
    FROM
      `strive-journal.firestore_export.story_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  id,
  name,
  date,
  goalId,
  userId,
  milestoneId,
  postId
