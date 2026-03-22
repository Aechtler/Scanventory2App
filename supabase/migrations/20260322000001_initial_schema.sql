-- =============================================================
-- ScanApp Initial Schema Migration
-- Generiert aus packages/backend/prisma/schema.prisma
-- =============================================================

-- Enums
CREATE TYPE "GroupRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'COMMENT');

-- User (öffentliches Profil — Auth liegt in auth.users von Supabase)
CREATE TABLE "User" (
  "id"          TEXT          NOT NULL,
  "email"       TEXT          NOT NULL,
  "name"        TEXT,
  "apiKey"      TEXT,
  "isAdmin"     BOOLEAN       NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Öffentliches Profil
  "username"    TEXT,
  "displayName" TEXT,
  "avatarUrl"   TEXT,
  "bio"         TEXT,
  "isPublic"    BOOLEAN       NOT NULL DEFAULT TRUE,

  -- Push-Notifications (v2)
  "pushToken"   TEXT,
  "lastSeenAt"  TIMESTAMPTZ,

  CONSTRAINT "User_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key"  UNIQUE ("email"),
  CONSTRAINT "User_apiKey_key" UNIQUE ("apiKey"),
  CONSTRAINT "User_username_key" UNIQUE ("username")
);

CREATE INDEX "User_username_idx" ON "User" ("username");

-- Follow (unidirektional: follower → following)
CREATE TABLE "Follow" (
  "followerId"  TEXT        NOT NULL,
  "followingId" TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId", "followingId"),
  CONSTRAINT "Follow_followerId_fkey"  FOREIGN KEY ("followerId")  REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Follow_followerId_idx"  ON "Follow" ("followerId");
CREATE INDEX "Follow_followingId_idx" ON "Follow" ("followingId");

-- Group
CREATE TABLE "Group" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "description" TEXT,
  "avatarUrl"   TEXT,
  "inviteCode"  TEXT        NOT NULL DEFAULT substr(md5(random()::TEXT), 1, 12),
  "isPublic"    BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ownerId"     TEXT        NOT NULL,

  CONSTRAINT "Group_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "Group_inviteCode_key" UNIQUE ("inviteCode"),
  CONSTRAINT "Group_ownerId_fkey"   FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Group_ownerId_idx"    ON "Group" ("ownerId");
CREATE INDEX "Group_inviteCode_idx" ON "Group" ("inviteCode");
CREATE INDEX "Group_name_idx"       ON "Group" ("name");

-- GroupMember
CREATE TABLE "GroupMember" (
  "groupId"  TEXT        NOT NULL,
  "userId"   TEXT        NOT NULL,
  "role"     "GroupRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "GroupMember_pkey"     PRIMARY KEY ("groupId", "userId"),
  CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE,
  CONSTRAINT "GroupMember_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id")  ON DELETE CASCADE
);

CREATE INDEX "GroupMember_userId_idx" ON "GroupMember" ("userId");

-- GroupInvitation
CREATE TABLE "GroupInvitation" (
  "id"            TEXT               NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "groupId"       TEXT               NOT NULL,
  "invitedById"   TEXT               NOT NULL,
  "invitedUserId" TEXT               NOT NULL,
  "status"        "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT "GroupInvitation_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "GroupInvitation_groupId_fkey"       FOREIGN KEY ("groupId")       REFERENCES "Group"("id") ON DELETE CASCADE,
  CONSTRAINT "GroupInvitation_invitedById_fkey"   FOREIGN KEY ("invitedById")   REFERENCES "User"("id")  ON DELETE CASCADE,
  CONSTRAINT "GroupInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id")  ON DELETE CASCADE
);

CREATE INDEX "GroupInvitation_invitedUserId_status_idx" ON "GroupInvitation" ("invitedUserId", "status");
CREATE INDEX "GroupInvitation_groupId_idx" ON "GroupInvitation" ("groupId");

-- ScannedItem
CREATE TABLE "ScannedItem" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"      TEXT,

  -- Produktdaten (von Gemini Vision)
  "productName" TEXT        NOT NULL,
  "category"    TEXT        NOT NULL,
  "brand"       TEXT,
  "condition"   TEXT        NOT NULL,
  "confidence"  FLOAT8      NOT NULL,
  "gtin"        TEXT,

  -- Suchkonfiguration
  "searchQuery"   TEXT      NOT NULL,
  "searchQueries" JSONB,

  -- Bild (Supabase Storage Pfad / Filename)
  "imageFilename" TEXT      NOT NULL,
  "originalUri"   TEXT,

  -- Preisdaten
  "priceStats"              JSONB,
  "ebayListings"            JSONB,
  "ebayListingsFetchedAt"   TIMESTAMPTZ,

  -- Kleinanzeigen
  "kleinanzeigenListings"          JSONB,
  "kleinanzeigenListingsFetchedAt" TIMESTAMPTZ,

  -- KI-Marktwert
  "marketValue"          JSONB,
  "marketValueFetchedAt" TIMESTAMPTZ,

  -- Manueller Verkaufspreis
  "finalPrice"     FLOAT8,
  "finalPriceNote" TEXT,

  "scannedAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "ScannedItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ScannedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "ScannedItem_userId_idx"             ON "ScannedItem" ("userId");
CREATE INDEX "ScannedItem_scannedAt_idx"          ON "ScannedItem" ("scannedAt");
CREATE INDEX "ScannedItem_userId_scannedAt_idx"   ON "ScannedItem" ("userId", "scannedAt");
CREATE INDEX "ScannedItem_productName_idx"        ON "ScannedItem" ("productName");
CREATE INDEX "ScannedItem_category_idx"           ON "ScannedItem" ("category");

-- SharedItem
CREATE TABLE "SharedItem" (
  "id"               TEXT             NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "itemId"           TEXT             NOT NULL,
  "sharedById"       TEXT             NOT NULL,
  "sharedWithUserId" TEXT,
  "sharedWithGroupId" TEXT,
  "permission"       "SharePermission" NOT NULL DEFAULT 'VIEW',
  "sharedAt"         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT "SharedItem_pkey"                PRIMARY KEY ("id"),
  CONSTRAINT "SharedItem_itemId_fkey"         FOREIGN KEY ("itemId")           REFERENCES "ScannedItem"("id") ON DELETE CASCADE,
  CONSTRAINT "SharedItem_sharedById_fkey"     FOREIGN KEY ("sharedById")       REFERENCES "User"("id")        ON DELETE CASCADE,
  CONSTRAINT "SharedItem_sharedWithUser_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "User"("id")        ON DELETE CASCADE,
  CONSTRAINT "SharedItem_sharedWithGroup_fkey" FOREIGN KEY ("sharedWithGroupId") REFERENCES "Group"("id")     ON DELETE CASCADE
);

CREATE INDEX "SharedItem_sharedById_idx"       ON "SharedItem" ("sharedById");
CREATE INDEX "SharedItem_sharedWithUserId_idx" ON "SharedItem" ("sharedWithUserId");
CREATE INDEX "SharedItem_sharedWithGroupId_idx" ON "SharedItem" ("sharedWithGroupId");
CREATE INDEX "SharedItem_itemId_idx"           ON "SharedItem" ("itemId");

-- Messaging (v2 — Tabellen existieren, werden noch nicht befüllt)
CREATE TABLE "Conversation" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationParticipant" (
  "conversationId" TEXT NOT NULL,
  "userId"         TEXT NOT NULL,

  CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("conversationId", "userId"),
  CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
  CONSTRAINT "ConversationParticipant_userId_fkey"         FOREIGN KEY ("userId")         REFERENCES "User"("id")         ON DELETE CASCADE
);

CREATE TABLE "Message" (
  "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "conversationId" TEXT        NOT NULL,
  "senderId"       TEXT        NOT NULL,
  "content"        TEXT        NOT NULL,
  "sentAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "readAt"         TIMESTAMPTZ,

  CONSTRAINT "Message_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_senderId_fkey"       FOREIGN KEY ("senderId")       REFERENCES "User"("id")         ON DELETE CASCADE
);

CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message" ("conversationId", "sentAt");

-- updatedAt Trigger-Funktion (ersetzt Prisma @updatedAt)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "User_updatedAt"       BEFORE UPDATE ON "User"        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Group_updatedAt"      BEFORE UPDATE ON "Group"       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "ScannedItem_updatedAt" BEFORE UPDATE ON "ScannedItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
