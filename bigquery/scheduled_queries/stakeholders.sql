SELECT
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  updatedBy,
  uid,
  isAdmin,
  isAchiever,
  isSupporter,
  isSpectator,
  hasOpenRequestToJoin,
  hasInviteToJoin,
  goalId,
  goalPublicity,
  collectiveGoalId,
  lastCheckedGoal,
  lastCheckedChat
FROM
  (
    SELECT
      document_id,
      JSON_EXTRACT_SCALAR(path_params, '$.goalId') AS param_goalId,
      FIRST_VALUE(operation) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) = "DELETE" AS is_deleted,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.createdAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS createdAt,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.updatedAt')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS updatedAt,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.updatedBy')
      ) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) AS updatedBy,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.uid')
      ) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) AS uid,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.isAdmin')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS isAdmin,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.isAchiever')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS isAchiever,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.isSupporter')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS isSupporter,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.isSpectator')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS isSpectator,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.hasOpenRequestToJoin')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS hasOpenRequestToJoin,
      `strive-journal.firestore_export.firestoreBoolean`(
        FIRST_VALUE(
          JSON_EXTRACT_SCALAR(data, '$.hasInviteToJoin')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS hasInviteToJoin,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.goalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) AS goalId,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.goalPublicity')
      ) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) AS goalPublicity,
      FIRST_VALUE(
        JSON_EXTRACT_SCALAR(data, '$.collectiveGoalId')
      ) OVER(
        PARTITION BY document_name
        ORDER BY timestamp DESC
      ) AS collectiveGoalId,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.lastCheckedGoal')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS lastCheckedGoal,
      `strive-journal.firestore_export.firestoreTimestamp`(
        FIRST_VALUE(
          JSON_EXTRACT(data, '$.lastCheckedChat')
        ) OVER(
          PARTITION BY document_name
          ORDER BY timestamp DESC
        )
      ) AS lastCheckedChat
    FROM
      `strive-journal.firestore_export.stakeholders_raw_latest`
  )
WHERE
  NOT is_deleted
GROUP BY
  document_id,
  param_goalId,
  createdAt,
  updatedAt,
  updatedBy,
  uid,
  isAdmin,
  isAchiever,
  isSupporter,
  isSpectator,
  hasOpenRequestToJoin,
  hasInviteToJoin,
  goalId,
  goalPublicity,
  collectiveGoalId,
  lastCheckedGoal,
  lastCheckedChat
