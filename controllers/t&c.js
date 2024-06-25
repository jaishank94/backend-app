import { asyncError } from "../middlewares/error.js";
import { TermAndCondition } from "../models/t&c.js";

export const getTermsAndConditions = asyncError(async (req, res, next) => {
  try {
    const tnc = await TermAndCondition.find();
    return res.status(200).json({ success: true, data: tnc });
  } catch (err) {
    res.status(500).send(err);
  }
});

export const createTermsAndConditions = asyncError(async (req, res) => {
  const createdBy = req.user._id;
  const { termsAndConditions, version = "" } = req.body;
  const data = {
    termsAndConditions, version, createdBy
  }
  try {
    await TermAndCondition.create(data);
    return res.status(201).json({ success: true, message: "Terms And Conditions successfully created"});
  } catch(err) {
    console.log(err)
    return res.status(400).json({ success: false, message: "Terms And Conditions could not be created"});
  }

});

export const updateTermsAndConditions = asyncError(async (req, res) => {
  const id = req.params.id;
  const updatedBy = req.user._id;
  const { termsAndConditions, version = "" } = req.body;
  const data = {
    termsAndConditions, version, updatedBy, updatedAt: new Date(Date.now())
  }
  try {
    await TermAndCondition.findByIdAndUpdate(id, data);
    return res.status(201).json({ success: true, message: "Terms And Conditions successfully updated"});
  } catch(err) {
    return res.status(400).json({ success: false, message: "Terms And Conditions could not be updated"});
  }
});

export const deleteTermsAndConditions = asyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    const tnc = await TermAndCondition.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Terms And Conditions successfully deleted" });
  } catch (err) {
    res.status(500).send(err);
  }
});