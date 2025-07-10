"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecognitionStatus = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRecognitionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Support both array and single object
        const items = Array.isArray(req.body.items)
            ? req.body.items
            : req.body.mediaId
                ? [req.body]
                : [];
        if (items.length === 0) {
            res.status(400).json({ message: "Invalid request body" });
            return;
        }
        let totalMatches = 0;
        let totalNewPersons = 0;
        for (const item of items) {
            const { mediaId, matches = [], newPersons = [] } = item;
            if (!mediaId)
                continue;
            const media = yield prisma.media.findUnique({ where: { id: mediaId } });
            if (!media) {
                console.warn(`⚠️ Media not found for id: ${mediaId}`);
                continue;
            }
            // Save new persons
            for (const personId of newPersons) {
                const existing = yield prisma.person.findUnique({
                    where: { id: personId },
                });
                if (!existing) {
                    yield prisma.person.create({
                        data: {
                            id: personId,
                            userId: media.userId,
                            name: "Unknown",
                            folderPath: `/persons/${personId}`,
                        },
                    });
                    totalNewPersons++;
                    console.log(`✅ New person created: ${personId}`);
                }
            }
            // Save recognized faces
            for (const match of matches) {
                const { personId, boundingBox, encoding, similarity, isPotentialMatch, } = match;
                if (!personId || !boundingBox) {
                    console.warn(`⚠️ Skipped face with missing personId or boundingBox`);
                    continue;
                }
                yield prisma.recognizedFace.create({
                    data: {
                        mediaId,
                        personId,
                        boundingBox,
                        encoding: encoding ? JSON.stringify(encoding) : null,
                        similarity: similarity !== null && similarity !== void 0 ? similarity : 1,
                        isPotentialMatch: isPotentialMatch !== null && isPotentialMatch !== void 0 ? isPotentialMatch : true,
                    },
                });
                totalMatches++;
            }
            // Update recognition status
            yield prisma.media.update({
                where: { id: mediaId },
                data: {
                    recognitionStatus: "DONE",
                    width: (_a = item.width) !== null && _a !== void 0 ? _a : undefined,
                    height: (_b = item.height) !== null && _b !== void 0 ? _b : undefined,
                },
            });
            console.log(`✅ Processed media ${mediaId}: ${matches.length} faces, ${newPersons.length} new persons`);
        }
        console.log(`🎉 Recognition complete. Total matches: ${totalMatches}, new persons: ${totalNewPersons}`);
        res.status(200).json({
            message: "Recognition results saved successfully",
            savedMatches: totalMatches,
            newPersons: totalNewPersons,
        });
    }
    catch (error) {
        console.error("❌ Error processing recognition status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getRecognitionStatus = getRecognitionStatus;
