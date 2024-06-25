import { asyncError } from "../middlewares/error.js";
import { PrivacyPolicy } from "../models/privacyPolicy.js";

export const getPrivacyPolicy = asyncError(async (req, res, next) => {
  try {
    const tnc = await PrivacyPolicy.find();
    return res.status(200).json({ success: true, data: tnc });
  } catch (err) {
    res.status(500).send(err);
  }
});

export const createPrivacyPolicy = asyncError(async (req, res) => {
  const createdBy = req.user._id;
  const { privacyPolicy, version = "" } = req.body;
  const data = {
    privacyPolicy, version, createdBy
  }
  try {
    await PrivacyPolicy.create(data);
    return res.status(201).json({ success: true, message: "Privacy Policy successfully created"});
  } catch(err) {
    return res.status(400).json({ success: false, message: "Privacy Policy could not be created"});
  }

});

export const updatePrivacyPolicy = asyncError(async (req, res) => {
  const id = req.params.id;
  const updatedBy = req.user._id;
  const { privacyPolicy, version = "" } = req.body;
  const data = {
    privacyPolicy, version, updatedBy, updatedAt: new Date(Date.now())
  }
  try {
    await PrivacyPolicy.findByIdAndUpdate(id, data);
    return res.status(201).json({ success: true, message: "Privacy Policy successfully updated"});
  } catch(err) {
    return res.status(400).json({ success: false, message: "Privacy Policy could not be updated"});
  }
});

export const deletePrivacyPolicy = asyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    const tnc = await PrivacyPolicy.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Privacy Policy successfully deleted" });
  } catch (err) {
    res.status(500).send(err);
  }
});