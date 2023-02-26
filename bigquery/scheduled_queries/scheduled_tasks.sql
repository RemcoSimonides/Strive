SELECT
  document_id,
  worker,
  performAt,
  status,
  options_goalId,
  options_milestoneId,
  options_userId,
  options_inviteTokenId,
  options_index
FROM
  (
    SELECT
      document_id,
      FIRST_VALUE(operation) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) = "DELETE" AS is_deleted,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.worker')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS worker,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.performAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS performAt,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.status')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS status,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.options.goalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS options_goalId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.options.milestoneId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS options_milestoneId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.options.userId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS options_userId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.options.inviteTokenId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS options_inviteTokenId,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.options.index')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS options_index
    FROM
      `strive-journal.firestore_export.scheduled_tasks_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  worker,
  performAt,
  status,
  options_goalId,
  options_milestoneId,
  options_userId,
  options_inviteTokenId,
  options_index
