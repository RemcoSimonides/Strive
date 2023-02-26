SELECT
  document_id,
  createdAt,
  updatedAt,
  name,
  goalId,
  userId,
  milestoneId,
  postId,
  supportId,
  commentId
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
        JSON_EXTRACT_SCALAR(data, '$.name')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS name,
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
      ) AS postId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.supportId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS supportId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.commentId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS commentId
    FROM
      `strive-journal.firestore_export.goal_events_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  createdAt,
  updatedAt,
  name,
  goalId,
  userId,
  milestoneId,
  postId,
  supportId,
  commentId
