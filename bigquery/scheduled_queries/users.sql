SELECT
  document_id,
  createdAt,
  updatedAt,
  uid,
  username,
  photoURL,
  numberOfSpectating,
  numberOfSpectators
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
        JSON_EXTRACT_SCALAR(data, '$.uid')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS uid,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.username')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS username,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.photoURL')
      ) OVER(
        PARTITION BY document_name
        ORDER BY
          timestamp DESC
      ) AS photoURL,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.numberOfSpectating')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS numberOfSpectating,
      `strive-journal.firestore_export.firestoreNumber`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.numberOfSpectators')
        ) OVER(
          PARTITION BY document_name
          ORDER BY
            timestamp DESC
        )
      ) AS numberOfSpectators
    FROM
      `strive-journal.firestore_export.users_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  createdAt,
  updatedAt,
  uid,
  username,
  photoURL,
  numberOfSpectating,
  numberOfSpectators
