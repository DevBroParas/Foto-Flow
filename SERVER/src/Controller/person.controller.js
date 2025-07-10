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
exports.deleteAllPersons = exports.deletePerson = exports.updatePerson = exports.getPersonById = exports.getAllPersons = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllPersons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const persons = yield prisma.person.findMany({
            where: { userId },
            include: {
                faces: {
                    include: {
                        media: {
                            select: {
                                id: true,
                                url: true,
                                width: true,
                                height: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        res.status(200).json(persons);
    }
    catch (error) {
        console.error("❌ Error fetching persons:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getAllPersons = getAllPersons;
const getPersonById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const person = yield prisma.person.findUnique({
        where: { id },
        include: {
            faces: {
                include: {
                    media: true,
                },
            },
        },
    });
    if (!person || person.userId !== userId) {
        res.status(404).json({ message: "Person not found" });
        return;
    }
    res.json(person);
});
exports.getPersonById = getPersonById;
const updatePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const person = yield prisma.person.findUnique({ where: { id } });
    if (!person || person.userId !== userId) {
        res.status(404).json({ message: "Person not found" });
        return;
    }
    const updated = yield prisma.person.update({
        where: { id },
        data: { name },
    });
    res.json(updated);
});
exports.updatePerson = updatePerson;
const deletePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const person = yield prisma.person.findUnique({ where: { id } });
    if (!person || person.userId !== userId) {
        res.status(404).json({ message: "Person not found" });
        return;
    }
    yield prisma.recognizedFace.deleteMany({ where: { personId: id } });
    yield prisma.person.delete({ where: { id } });
    res.json({ message: "Person deleted" });
});
exports.deletePerson = deletePerson;
// delete all persons for a user
const deleteAllPersons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(400).json({ message: "User not authenticated." });
        return;
    }
    yield prisma.recognizedFace.deleteMany({ where: { person: { userId } } });
    yield prisma.person.deleteMany({ where: { userId } });
    res.json({ message: "All persons deleted" });
});
exports.deleteAllPersons = deleteAllPersons;
