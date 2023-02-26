SELECT
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  updatedBy,
  id,
  _order,
  content,
  description,
  status,
  deadline,
  achieverId,
  deletedAt,
  finishedAt
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
        JSON_EXTRACT_SCALAR(data, '$.updatedBy')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS updatedBy,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.id')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS id,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.order')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS _order,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.content')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS content,
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
          JSON_EXTRACT(data, '$.deadline')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS deadline,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.achieverId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS achieverId,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.deletedAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS deletedAt,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.finishedAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS finishedAt
    FROM
      `strive-journal.firestore_export.milestones_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  updatedBy,
  id,
  _order,
  content,
  description,
  status,
  deadline,
  achieverId,
  deletedAt,
  finishedAt
