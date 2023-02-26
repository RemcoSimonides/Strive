SELECT
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  id,
  description,
  status,
  needsDecision,
  counterDescription,
  counterNeedsDecision,
  counterStatus,
  goalId,
  milestoneId,
  supporterId,
  recipientId
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
        JSON_EXTRACT_SCALAR(data, '$.description')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS description,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.status')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS status,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.needsDecision')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS needsDecision,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.counterDescription')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS counterDescription,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.counterNeedsDecision')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS counterNeedsDecision,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.counterStatus')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS counterStatus,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.goalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS goalId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.milestoneId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS milestoneId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.supporterId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS supporterId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.recipientId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS recipientId
    FROM
      `strive-journal.firestore_export.supports_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  id,
  description,
  status,
  needsDecision,
  counterDescription,
  counterNeedsDecision,
  counterStatus,
  goalId,
  milestoneId,
  supporterId,
  recipientId
