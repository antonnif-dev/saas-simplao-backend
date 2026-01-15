//import { Firestore } from 'firebase-admin/firestore';
import { db } from "../config/firebase";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

export class PatientRepository<T = any> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private getCollection(tenantId: string) {
    console.log("🔥 FIRESTORE PATH:", `tenants/${tenantId}/${this.collectionName}`);
    return db
      .collection("tenants")
      .doc(tenantId)
      .collection(this.collectionName);
  }

  // ✅ NOVO: findAll
  async findAll(tenantId: string): Promise<T[]> {
    const snap = await this.getCollection(tenantId).get();
    return snap.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(tenantId: string, data: any): Promise<T> {
    const docRef = this.getCollection(tenantId).doc();
    const payload = {
      ...data,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.set(payload);
    return { id: docRef.id, ...payload } as T;
  }

  async findById(tenantId: string, id: string): Promise<T | null> {
    const doc = await this.getCollection(tenantId).doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (data?.tenantId !== tenantId) return null;

    return { id: doc.id, ...data } as T;
  }

  async update(tenantId: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = this.getCollection(tenantId).doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.tenantId !== tenantId) {
      throw new Error("Document not found or access denied");
    }

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const docRef = this.getCollection(tenantId).doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.tenantId !== tenantId) {
      throw new Error("Document not found or access denied");
    }

    await docRef.delete();
  }
}